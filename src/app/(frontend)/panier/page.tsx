import type { Metadata } from 'next'

import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: 'Panier · Koren France',
  robots: { index: false, follow: false },
}

export default function Panier() {
  return (
    <section className="mx-auto max-w-[680px] px-5 py-24 text-center md:px-16">
      <div className="font-mono text-[11px] uppercase tracking-[2.5px] text-or">Votre panier</div>
      <h1 className="mt-3 font-display text-[34px] font-medium text-encre">Votre panier est vide</h1>
      <p className="mx-auto mt-4 max-w-[440px] font-serif text-encre-douce">
        La commande en ligne arrive bientôt. En attendant, parcourez le catalogue ou contactez-nous
        pour toute commande.
      </p>
      <Link
        href="/catalogue"
        className="mt-8 inline-block rounded-[3px] border border-bordeaux px-5 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-bordeaux transition-colors hover:bg-bordeaux hover:text-papier"
      >
        Découvrir le catalogue
      </Link>
    </section>
  )
}
