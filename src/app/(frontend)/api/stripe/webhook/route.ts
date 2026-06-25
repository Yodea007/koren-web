import configPromise from '@payload-config'
import { after } from 'next/server'
import { getPayload } from 'payload'
import type Stripe from 'stripe'

import { renderRecapCommandePdf } from '@/components/commande/RecapCommandePdf'
import { formatPrix } from '@/utilities/koren'
import { resoudrePanier, type ItemPanier } from '@/utilities/panier'
import { getStripe, stripeWebhookSecret } from '@/utilities/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const yyyymmdd = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`

// Webhook Stripe : sur `checkout.session.completed`, enregistre la commande Payload
// (source de vérité) puis envoie les e-mails. Signature vérifiée (STRIPE_WEBHOOK_SECRET).
export async function POST(req: Request): Promise<Response> {
  const stripe = getStripe()
  if (!stripe || !stripeWebhookSecret) {
    return Response.json({ error: 'Webhook non configuré.' }, { status: 500 })
  }

  const sig = req.headers.get('stripe-signature')
  if (!sig) return Response.json({ error: 'Signature manquante.' }, { status: 400 })

  let event: Stripe.Event
  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret)
  } catch (err) {
    console.error('Webhook signature invalide', err)
    return Response.json({ error: 'Signature invalide.' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  if (session.payment_status !== 'paid') {
    return Response.json({ received: true })
  }

  const payload = await getPayload({ config: configPromise })

  // Idempotence : un même paiement peut être notifié plusieurs fois.
  const deja = await payload.find({
    collection: 'commandes-client',
    where: { stripeSessionId: { equals: session.id } },
    limit: 1,
  })
  if (deja.totalDocs > 0) {
    return Response.json({ received: true, duplicate: true })
  }

  // Reconstituer le panier depuis les line items (la `ref` est dans la metadata produit).
  let items: ItemPanier[] = []
  try {
    const li = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
      limit: 100,
    })
    items = li.data
      .map((it) => ({
        ref: (it.price?.product as Stripe.Product | undefined)?.metadata?.ref ?? '',
        qte: it.quantity ?? 0,
      }))
      .filter((x) => x.ref)
  } catch (err) {
    console.error('Webhook : échec listLineItems', err)
  }

  const { lignes, nbArticles, sousTotalTTC, port, totalTTC, tvaIncluse } = await resoudrePanier(items)

  // Coordonnées client + adresse de livraison (champs Stripe au nommage mouvant → casts souples).
  const cd = session.customer_details
  const s = session as unknown as {
    collected_information?: { shipping_details?: { name?: string; address?: Stripe.Address } }
    shipping_details?: { name?: string; address?: Stripe.Address }
  }
  const shipping = s.collected_information?.shipping_details ?? s.shipping_details ?? null
  const addr = shipping?.address ?? cd?.address ?? null

  const now = new Date()
  const reference = `KF-${yyyymmdd(now)}-${session.id.slice(-6).toUpperCase()}`

  const commande = await payload.create({
    collection: 'commandes-client',
    data: {
      reference,
      statut: 'payee',
      client: {
        nom: shipping?.name ?? cd?.name ?? undefined,
        email: cd?.email ?? undefined,
        telephone: cd?.phone ?? undefined,
      },
      adresse: {
        ligne1: addr?.line1 ?? undefined,
        ligne2: addr?.line2 ?? undefined,
        codePostal: addr?.postal_code ?? undefined,
        ville: addr?.city ?? undefined,
        pays: addr?.country ?? 'FR',
      },
      lignes,
      sousTotalTTC,
      port,
      totalTTC,
      tvaIncluse,
      stripeSessionId: session.id,
      stripePaymentIntent:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? undefined),
    },
  })

  // PDF + e-mails APRÈS la réponse (Stripe ne doit pas attendre la génération PDF ni le SMTP).
  after(async () => {
    const dateStr = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(now)

    // 1) Générer le reçu PDF
    let pdf: Buffer | null = null
    try {
      pdf = await renderRecapCommandePdf(
        {
          reference,
          client: {
            nom: shipping?.name ?? cd?.name,
            email: cd?.email,
            telephone: cd?.phone,
          },
          adresse: {
            ligne1: addr?.line1,
            ligne2: addr?.line2,
            codePostal: addr?.postal_code,
            ville: addr?.city,
            pays: addr?.country,
          },
          lignes,
          sousTotalTTC,
          port,
          totalTTC,
          tvaIncluse,
        },
        dateStr,
      )
    } catch (err) {
      payload.logger.error({ err, msg: 'Commande en ligne : échec génération PDF' })
    }

    // 2) Joindre le PDF à la fiche commande (best-effort)
    if (pdf) {
      try {
        const media = await payload.create({
          collection: 'media',
          data: { alt: `Reçu commande ${reference}` },
          file: {
            data: pdf,
            mimetype: 'application/pdf',
            name: `commande-${reference}.pdf`,
            size: pdf.length,
          },
        })
        await payload.update({ collection: 'commandes-client', id: commande.id, data: { pdf: media.id } })
      } catch (err) {
        payload.logger.error({ err, msg: 'Commande en ligne : échec attachement PDF' })
      }
    }

    // 3) E-mail de confirmation (seulement si le SMTP est configuré)
    if (!(process.env.SMTP_USER && process.env.SMTP_PASS)) return
    const maison = process.env.COMMANDES_EMAIL || 'e.alhadef@gmail.com'
    const clientEmail = cd?.email || undefined
    const corps = [
      `Bonjour,`,
      ``,
      `Merci pour votre commande sur Koren France.`,
      ``,
      `Référence : ${reference}`,
      ``,
      ...lignes.map((l) => `• ${l.qte} × ${l.titre} — ${formatPrix(l.totalLigne)}`),
      ``,
      `Sous-total : ${formatPrix(sousTotalTTC)}`,
      `Frais de port : ${port === 0 ? 'Offert' : formatPrix(port)}`,
      `Total payé : ${formatPrix(totalTTC)} (TVA 5,5 % incluse : ${formatPrix(tvaIncluse)})`,
      ``,
      `Votre commande est en préparation. Expédition sous 48 h.`,
      ``,
      `— Koren France`,
    ].join('\n')

    try {
      await payload.sendEmail({
        // Le client reçoit sa confirmation ; la maison (e.alhadef@gmail.com) est en copie cachée.
        // Sans e-mail client (cas rare), tout part vers la maison.
        to: clientEmail || maison,
        ...(clientEmail ? { bcc: maison } : {}),
        replyTo: maison,
        subject: `Commande Koren France — ${reference}`,
        text: corps,
        ...(pdf ? { attachments: [{ filename: `commande-${reference}.pdf`, content: pdf }] } : {}),
      })
    } catch (err) {
      payload.logger.error({ err, msg: 'Commande en ligne : échec envoi e-mail' })
    }
  })

  return Response.json({ received: true, commande: commande.id })
}
