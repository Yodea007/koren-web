import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Article } from '@/utilities/tarif'
import { renderCommandePdf, type LibraireInfo, type LigneCommande } from '@/components/libraires/BonCommandePdf'
import { articlesDeLivre } from '@/utilities/tarif'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const round2 = (n: number) => Math.round(n * 100) / 100

type Body = {
  libraire?: LibraireInfo
  remisePourcent?: number
  lignes?: { ref: string; qte: number }[]
}

export async function POST(req: Request): Promise<Response> {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const raw = body.libraire ?? {}
  const magasin = (raw.magasin ?? '').trim()
  const email = (raw.email ?? '').trim()
  if (!magasin || !email) {
    return Response.json({ error: 'Le magasin et l’e-mail sont obligatoires.' }, { status: 400 })
  }
  const libraire = {
    magasin,
    email,
    nom: raw.nom?.trim() || undefined,
    telephone: raw.telephone?.trim() || undefined,
    adresse: raw.adresse?.trim() || undefined,
  }

  const remisePourcent = Math.min(100, Math.max(0, Number(body.remisePourcent) || 0))
  const items = Array.isArray(body.lignes) ? body.lignes : []

  const payload = await getPayload({ config: configPromise })

  // Index des articles autorisés (prix recalculés côté serveur).
  const { docs } = await payload.find({
    collection: 'livres',
    depth: 1,
    limit: 1000,
    pagination: false,
    overrideAccess: false,
  })
  const index = new Map<string, Article>()
  for (const livre of docs) for (const a of articlesDeLivre(livre)) index.set(a.ref, a)

  const lignes: LigneCommande[] = []
  let montantBrut = 0
  let nbArticles = 0
  for (const it of items) {
    const qte = Math.max(0, Math.floor(Number(it?.qte) || 0))
    if (!qte) continue
    const a = index.get(it?.ref)
    if (!a) continue
    const totalLigne = round2(a.prixTTC * qte)
    montantBrut = round2(montantBrut + totalLigne)
    nbArticles += qte
    lignes.push({ titre: a.titre, isbn: a.isbn, prixTTC: a.prixTTC, qte, totalLigne })
  }

  if (lignes.length === 0) {
    return Response.json({ error: 'Aucune quantité saisie.' }, { status: 400 })
  }

  const montantNet = round2(montantBrut * (1 - remisePourcent / 100))
  const totaux = { nbArticles, montantBrut, montantNet }

  const now = new Date()
  const dateStr = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(now)
  const reference = `${libraire.magasin.trim().slice(0, 40)} · ${new Intl.DateTimeFormat('fr-FR').format(now)}`

  // 1) Enregistrer la commande (source de vérité)
  const commande = await payload.create({
    collection: 'commandes',
    data: { reference, statut: 'nouvelle', libraire, remisePourcent, lignes, totaux },
  })

  // 2) Générer le PDF rempli
  const pdf = await renderCommandePdf({ reference, libraire, remisePourcent, lignes, totaux }, dateStr)

  // 3) Joindre le PDF à la fiche (best-effort)
  try {
    const media = await payload.create({
      collection: 'media',
      data: { alt: `Bon de commande ${reference}` },
      file: {
        data: pdf,
        mimetype: 'application/pdf',
        name: `bon-commande-${commande.id}.pdf`,
        size: pdf.length,
      },
    })
    await payload.update({ collection: 'commandes', id: commande.id, data: { pdf: media.id } })
  } catch (err) {
    payload.logger.error({ err, msg: 'Bon de commande : échec attachement PDF' })
  }

  // 4) Envoyer la copie par e-mail (best-effort, seulement si le SMTP est configuré)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const diffuseur = process.env.COMMANDES_EMAIL || 'e.alhadef@gmail.com'
      // Envoi aux DEUX : le libraire (sa confirmation) ET Koren (la copie).
      const destinataires = [...new Set([diffuseur, libraire.email].filter(Boolean))]
      await payload.sendEmail({
        to: destinataires,
        replyTo: diffuseur,
        subject: `Commande Koren France — ${libraire.magasin}`,
        text: [
          `Bonjour,`,
          ``,
          `Voici le récapitulatif de la commande (PDF en pièce jointe).`,
          ``,
          `Magasin : ${libraire.magasin}`,
          libraire.nom ? `Contact : ${libraire.nom}` : null,
          `E-mail : ${libraire.email}`,
          libraire.telephone ? `Téléphone : ${libraire.telephone}` : null,
          ``,
          `Articles : ${nbArticles} · Brut : ${montantBrut} € · Remise : ${remisePourcent} % · Net : ${montantNet} €`,
          `Référence : ${reference}`,
          ``,
          `— Koren France (copie : libraire + diffuseur)`,
        ]
          .filter(Boolean)
          .join('\n'),
        attachments: [{ filename: `bon-commande-${reference}.pdf`, content: pdf }],
      })
    } catch (err) {
      payload.logger.error({ err, msg: 'Bon de commande : échec envoi e-mail' })
    }
  }

  // 5) Renvoyer le PDF pour téléchargement immédiat
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="bon-commande-koren.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
