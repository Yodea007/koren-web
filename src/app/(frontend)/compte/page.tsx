import type { Metadata } from 'next'

import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: 'Mon compte · Koren France',
  robots: { index: false, follow: false },
}

export default function Compte() {
  return (
    <section className="mx-auto max-w-[680px] px-5 py-24 text-center md:px-16">
      <div className="font-mono text-[11px] uppercase tracking-[2.5px] text-or">Espace client</div>
      <h1 className="mt-3 font-display text-[34px] font-medium text-encre">Bientôt disponible</h1>
      <p className="mx-auto mt-4 max-w-[440px] font-serif text-encre-douce">
        Les comptes clients arrivent prochainement. Libraires : retrouvez votre bon de commande
        dédié dès maintenant.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/libraires"
          className="inline-block rounded-[3px] border border-bordeaux px-5 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-bordeaux transition-colors hover:bg-bordeaux hover:text-papier"
        >
          Espace libraires
        </Link>
        <Link
          href="/catalogue"
          className="inline-block rounded-[3px] border border-[#d8cdb8] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-encre-douce transition-colors hover:border-bordeaux hover:text-bordeaux"
        >
          Le catalogue
        </Link>
      </div>
    </section>
  )
}
