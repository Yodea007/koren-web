import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { centimes, fraisDePort, tvaIncluse as partTVA } from '@/utilities/commerce'
import { articlesDeLivre, type Article } from '@/utilities/tarif'

export type ItemPanier = { ref: string; qte: number }

export type LigneResolue = {
  ref: string
  titre: string
  isbn: string
  prixTTC: number
  qte: number
  totalLigne: number
}

export type PanierResolu = {
  lignes: LigneResolue[]
  nbArticles: number
  sousTotalTTC: number
  port: number
  totalTTC: number
  tvaIncluse: number
}

// Recalcule un panier UNIQUEMENT à partir des données Payload (jamais des prix du
// client) : prix, port et TVA sont la source de vérité serveur. Partagé entre
// /api/checkout et le webhook Stripe pour garantir des montants identiques.
export async function resoudrePanier(items: ItemPanier[]): Promise<PanierResolu> {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'livres',
    depth: 1,
    limit: 1000,
    pagination: false,
    overrideAccess: false,
  })

  const index = new Map<string, Article>()
  for (const livre of docs) for (const a of articlesDeLivre(livre)) index.set(a.ref, a)

  const lignes: LigneResolue[] = []
  let sousTotalTTC = 0
  let nbArticles = 0
  for (const it of items ?? []) {
    const qte = Math.max(0, Math.floor(Number(it?.qte) || 0))
    if (!qte) continue
    const a = index.get(it?.ref)
    if (!a || a.disponible === false) continue
    const totalLigne = centimes(a.prixTTC * qte)
    sousTotalTTC = centimes(sousTotalTTC + totalLigne)
    nbArticles += qte
    lignes.push({ ref: a.ref, titre: a.titre, isbn: a.isbn, prixTTC: a.prixTTC, qte, totalLigne })
  }

  const port = fraisDePort(sousTotalTTC)
  const totalTTC = centimes(sousTotalTTC + port)
  const tva = centimes(partTVA(totalTTC))

  return { lignes, nbArticles, sousTotalTTC, port, totalTTC, tvaIncluse: tva }
}
