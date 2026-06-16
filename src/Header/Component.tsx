import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

import { labelRayon, ordreRayon } from '@/utilities/koren'
import { RayonsNav, RayonsNavLinks } from './RayonsNav'

export async function Header() {
  const payload = await getPayload({ config: configPromise })
  const { docs: categories } = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 50,
    select: { title: true, slug: true },
  })

  const rayons = categories
    .map((c) => ({ title: labelRayon(c.slug as string, c.title as string), slug: c.slug as string }))
    .sort((a, b) => ordreRayon(a.slug) - ordreRayon(b.slug))

  return (
    <header>
      {/* Barre utilitaire */}
      <div className="bg-encre text-[#d8cdb8] font-mono text-[10.5px] tracking-[1px] flex items-center justify-center gap-2 py-2 px-4 text-center">
        <span>LIVRAISON OFFERTE DÈS 60 €</span>
        <span className="opacity-40">·</span>
        <span className="text-[#e7c56b]">EXPÉDITION SOUS 48 H</span>
        <span className="opacity-40 hidden sm:inline">·</span>
        <span className="hidden sm:inline">SERVICE LIBRAIRES</span>
      </div>

      {/* Bandeau bordeaux : logo · compte · panier · recherche */}
      <div className="bg-bordeaux flex items-center justify-between gap-6 px-5 md:px-11 py-4">
        <Link href="/" className="shrink-0">
          <img
            src="/koren-logo.png"
            alt="Koren France"
            className="h-9 w-auto block brightness-0 invert"
          />
        </Link>
        <div className="flex items-center gap-3 md:gap-[18px] font-mono text-xs text-[#f3e7cf]">
          <Link href="/compte" className="hover:opacity-80 hidden sm:inline">
            Compte
          </Link>
          <Link href="/panier" className="text-[#f3d27a] hover:opacity-80">
            Panier (0)
          </Link>
          <Link
            href="/search"
            className="hidden md:flex items-center gap-2.5 w-[300px] border border-white/30 rounded-[22px] py-2.5 px-4 text-[11px] text-[#8a7d68] bg-carte"
          >
            <span className="text-sm text-bordeaux">⌕</span>
            <span>Rechercher un titre, un auteur…</span>
          </Link>
        </div>
      </div>

      {/* Nav rayons */}
      <Suspense fallback={<RayonsNavLinks rayons={rayons} activeSlug={null} />}>
        <RayonsNav rayons={rayons} />
      </Suspense>
    </header>
  )
}
