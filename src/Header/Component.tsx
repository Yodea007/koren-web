import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

import { labelCategorie, ordreCategorie } from '@/utilities/koren'
import { CartCount } from './CartCount'
import { CategoriesNav, CategoriesNavLinks } from './CategoriesNav'
import { MenuDrawer } from './MenuDrawer'

export async function Header() {
  const payload = await getPayload({ config: configPromise })
  const { docs: categories } = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 50,
    select: { title: true, slug: true },
  })

  const cats = categories
    .map((c) => ({ title: labelCategorie(c.slug as string, c.title as string), slug: c.slug as string }))
    .sort((a, b) => ordreCategorie(a.slug) - ordreCategorie(b.slug))

  return (
    <header>
      {/* Barre utilitaire */}
      <div className="bg-encre text-[#d8cdb8] font-mono text-[10.5px] tracking-[1px] flex items-center justify-center gap-2 py-2 px-4 text-center">
        <span>LIVRAISON OFFERTE DÈS 60 €</span>
        <span className="opacity-40">·</span>
        <span className="text-[#e7c56b]">EXPÉDITION SOUS 48 H</span>
        <span className="opacity-40 hidden sm:inline">·</span>
        <Link href="/libraires" className="hidden sm:inline hover:text-[#e7c56b]">
          COMMANDE LIBRAIRE
        </Link>
      </div>

      {/* Bandeau bordeaux : menu · logo · recherche · newsletter · compte · panier */}
      <div className="bg-bordeaux flex items-center justify-between gap-4 px-5 md:px-11 py-2">
        <div className="flex items-center gap-3 md:gap-6">
          {/* Menu hamburger (toutes tailles) : sections Éditions Koren + Aide */}
          <MenuDrawer />
          <Link href="/" className="shrink-0">
            <img
              src="/koren-logo.svg"
              alt="Koren France"
              width={922}
              height={296}
              className="h-14 w-auto block"
            />
          </Link>
        </div>
        <div className="flex items-center gap-4 md:gap-6 text-[#f3e7cf]">
          <Link href="/search" aria-label="Rechercher" className="block transition-opacity hover:opacity-70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="h-[23px] w-[23px]">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </Link>
          <Link
            href="/#newsletter"
            aria-label="Newsletter"
            className="flex items-center gap-2 rounded-full border border-[#e7c56b] bg-[#e7c56b] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[1.5px] text-bordeaux transition-colors hover:bg-[#f0d586]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
            <span className="hidden sm:inline">Newsletter</span>
          </Link>
          <Link href="/compte" aria-label="Mon compte" className="block transition-opacity hover:opacity-70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[23px] w-[23px]">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
            </svg>
          </Link>
          <Link href="/panier" aria-label="Mon panier" className="relative block transition-opacity hover:opacity-70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[23px] w-[23px]">
              <path d="M6 8h12l-1 11.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8z" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
            </svg>
            <CartCount />
          </Link>
        </div>
      </div>

      {/* Nav catégories (barre horizontale dédiée) */}
      <Suspense fallback={<CategoriesNavLinks categories={cats} activeSlug={null} />}>
        <CategoriesNav categories={cats} />
      </Suspense>
    </header>
  )
}
