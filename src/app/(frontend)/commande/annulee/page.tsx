import type { Metadata } from 'next'

import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: 'Paiement annulé · Koren France',
  robots: { index: false, follow: false },
}

// Retour Stripe « cancel » : le panier est conservé, on invite à reprendre.
export default function CommandeAnnulee() {
  return (
    <section className="mx-auto max-w-[620px] px-5 py-24 text-center md:px-16">
      <div className="font-mono text-[11px] uppercase tracking-[2.5px] text-or">Paiement interrompu</div>
      <h1 className="mt-3 font-display text-[34px] font-medium text-encre">Commande non finalisée</h1>
      <p className="mx-auto mt-4 max-w-[460px] font-serif text-encre-douce">
        Aucun montant n’a été débité. Votre panier est conservé : vous pouvez reprendre votre
        commande quand vous le souhaitez.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/panier"
          className="inline-block rounded-[3px] bg-bordeaux px-5 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-[#f7efe0] transition-colors hover:bg-bordeaux-profond"
        >
          Revenir au panier
        </Link>
        <Link
          href="/catalogue"
          className="inline-block rounded-[3px] border border-bordeaux px-5 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-bordeaux transition-colors hover:bg-bordeaux hover:text-papier"
        >
          Catalogue
        </Link>
      </div>
    </section>
  )
}
