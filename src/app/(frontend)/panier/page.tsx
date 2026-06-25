import type { Metadata } from 'next'

import React from 'react'

import { PanierClient } from './PanierClient'

export const metadata: Metadata = {
  title: 'Panier · Koren France',
  robots: { index: false, follow: false },
}

// ┌──────────────────────────────────────────────────────────────────┐
// │ PANIER (/panier). Coquille serveur (métadonnées) + <PanierClient>  │
// │ qui lit le panier (localStorage) et lance le paiement Stripe.      │
// └──────────────────────────────────────────────────────────────────┘
export default function Panier() {
  return <PanierClient />
}
