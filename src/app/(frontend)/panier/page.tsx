import type { Metadata } from 'next'

import React from 'react'

import { getReglagesLivraison } from '@/utilities/reglages'
import { PanierClient } from './PanierClient'

export const metadata: Metadata = {
  title: 'Panier · Koren France',
  robots: { index: false, follow: false },
}

// ┌──────────────────────────────────────────────────────────────────┐
// │ PANIER (/panier). Coquille serveur (métadonnées + réglages port)   │
// │ + <PanierClient> qui lit le panier (localStorage) et lance Stripe. │
// └──────────────────────────────────────────────────────────────────┘
export default async function Panier() {
  // Forfait + seuil de gratuité pilotés par le global « Réglages » (admin)
  const livraison = await getReglagesLivraison()
  return <PanierClient livraison={livraison} />
}
