import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { PORT_FORFAIT, PORT_GRATUIT_DES } from './commerce'

export type ReglagesLivraison = { forfait: number; gratuitDes: number }

// Lit le forfait de port et le seuil de gratuité depuis le global « Réglages »
// (admin), avec repli sur les constantes de commerce.ts si le global est vide.
export async function getReglagesLivraison(): Promise<ReglagesLivraison> {
  try {
    const payload = await getPayload({ config: configPromise })
    const r = await payload.findGlobal({ slug: 'reglages', depth: 0 })
    return {
      forfait: typeof r?.portForfait === 'number' ? r.portForfait : PORT_FORFAIT,
      gratuitDes: typeof r?.portGratuitDes === 'number' ? r.portGratuitDes : PORT_GRATUIT_DES,
    }
  } catch {
    return { forfait: PORT_FORFAIT, gratuitDes: PORT_GRATUIT_DES }
  }
}
