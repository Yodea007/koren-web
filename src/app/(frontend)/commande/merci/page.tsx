import type { Metadata } from 'next'

import Link from 'next/link'
import React from 'react'

import { getStripe } from '@/utilities/stripe'
import { ClearCart } from '../ClearCart'

export const metadata: Metadata = {
  title: 'Merci pour votre commande · Koren France',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Args = { searchParams: Promise<{ session_id?: string }> }

// Page de retour après un paiement Stripe réussi. Affiche un récap léger
// (montant + e-mail) lu depuis la session, et vide le panier.
export default async function CommandeMerci({ searchParams }: Args) {
  const { session_id } = await searchParams

  let email: string | null = null
  let total: number | null = null
  const stripe = getStripe()
  if (stripe && session_id) {
    try {
      const s = await stripe.checkout.sessions.retrieve(session_id)
      email = s.customer_details?.email ?? null
      total = typeof s.amount_total === 'number' ? s.amount_total / 100 : null
    } catch {
      /* session illisible → on reste sur le message générique */
    }
  }

  return (
    <section className="mx-auto max-w-[620px] px-5 py-24 text-center md:px-16">
      <ClearCart />
      <div className="font-mono text-[11px] uppercase tracking-[2.5px] text-or">Commande confirmée</div>
      <h1 className="mt-3 font-display text-[34px] font-medium text-encre">Merci pour votre commande</h1>
      <p className="mx-auto mt-4 max-w-[460px] font-serif text-encre-douce">
        Votre paiement a bien été reçu
        {total != null ? ` (${total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })})` : ''}.
        {email ? ` Un e-mail de confirmation va être envoyé à ${email}.` : ' Un e-mail de confirmation va vous être envoyé.'}
        {' '}Votre commande est en préparation, expédition sous 48 h.
      </p>
      <Link
        href="/catalogue"
        className="mt-8 inline-block rounded-[3px] border border-bordeaux px-5 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-bordeaux transition-colors hover:bg-bordeaux hover:text-papier"
      >
        Continuer mes achats
      </Link>
    </section>
  )
}
