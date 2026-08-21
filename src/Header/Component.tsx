import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

import { labelCategorieCourt, ordreCategorie } from '@/utilities/koren'
import { getMenu } from '@/utilities/menu'
import { getReglagesLivraison } from '@/utilities/reglages'
import { CartCount } from './CartCount'
import { CategoriesNav, CategoriesNavLinks } from './CategoriesNav'
import { MenuDrawer } from './MenuDrawer'

export async function Header() {
  const payload = await getPayload({ config: configPromise })
  const { docs: categories } = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 50,
    select: { title: true, titreCourt: true, slug: true, ordre: true },
  })

  const cats = categories
    .sort((a, b) => ordreCategorie(a) - ordreCategorie(b))
    .map((c) => ({ title: labelCategorieCourt(c), slug: c.slug as string }))

  const menuSections = await getMenu()

  // Seuil de livraison offerte (global « Réglages », modifiable dans l'admin)
  const { gratuitDes } = await getReglagesLivraison()

  return (
    <header>
      {/* Bandeau bordeaux : logo · recherche · libraires · panier.
          (Newsletter : uniquement dans le footer et le tiroir ☰ mobile.)
          Sur smartphone (< md) : seulement ☰ (à côté du logo), logo, recherche, panier —
          newsletter et compte passent dans le tiroir ☰. À partir de md : comme à l'origine. */}
      <div className="bg-bordeaux flex items-center justify-between gap-4 px-5 md:px-11 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <MenuDrawer sections={menuSections} categories={cats} />
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
        {/* Colonne de droite : rangée d'icônes + sous-ligne livraison alignée à droite */}
        <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-4 md:gap-6 text-[#f3e7cf]">
          <Link href="/search" aria-label="Rechercher" className="block transition-opacity hover:opacity-70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="h-[23px] w-[23px]">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </Link>
          {/* Espace libraires (remplace l'ancienne icône « Mon compte » — /compte reste accessible par URL) */}
          <Link href="/libraires" aria-label="Commande libraire" className="hidden md:block transition-opacity hover:opacity-70">
            {/* Devanture de librairie */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[23px] w-[23px]">
              <path d="M4.5 9.5 5.6 4.5h12.8l1.1 5" />
              <path d="M3.5 9.5h17" />
              <path d="M5 9.5V20h14V9.5" />
              <path d="M9.5 20v-5.5h5V20" />
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
        {/* Sous-ligne : seuil piloté par le global « Réglages » (admin → Réglages) */}
        <span className="hidden md:block whitespace-nowrap font-mono text-[9px] tracking-[0.5px] text-[#d8cdb8]">
          Livraison offerte dès {gratuitDes} €
        </span>
        </div>
      </div>

      {/* Barre catégories (masquée sur smartphone : les catégories sont dans le tiroir ☰) :
          ☰ (tout à gauche, tablette et desktop) + catégories */}
      <div className="hidden md:flex items-stretch bg-secondary border-b border-[#dbccae]">
        <MenuDrawer sections={menuSections} variante="barre" />
        <div className="min-w-0 flex-1">
          <Suspense fallback={<CategoriesNavLinks categories={cats} activeSlug={null} />}>
            <CategoriesNav categories={cats} />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
