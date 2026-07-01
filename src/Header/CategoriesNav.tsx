'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React from 'react'

type Categorie = { title: string; slug: string }

export const CategoriesNavLinks: React.FC<{
  categories: Categorie[]
  activeSlug: string | null
  nouveauteActive?: boolean
}> = ({ categories, activeSlug, nouveauteActive = false }) => (
  <nav className="flex items-center justify-center gap-3.5 md:gap-[18px] py-3 px-4 font-mono text-[13px] font-semibold tracking-[1.5px] uppercase overflow-x-auto overflow-y-hidden">
    <Link
      href="/catalogue?nouveaute=1"
      className={
        'whitespace-nowrap rounded-full border px-3.5 py-1.5 transition-colors ' +
        (nouveauteActive
          ? 'border-bordeaux bg-bordeaux text-[#f7efe0]'
          : 'border-bordeaux text-bordeaux hover:bg-bordeaux hover:text-[#f7efe0]')
      }
    >
      Nouveautés
    </Link>
    <span className="h-4 w-px shrink-0 bg-[#cbb98f]" aria-hidden />
    {categories.map((r, i) => {
      const active = r.slug === activeSlug
      return (
        <React.Fragment key={r.slug}>
          {i > 0 && <span className="h-4 w-px shrink-0 bg-[#cbb98f]" aria-hidden />}
          <Link
            href={`/catalogue?categorie=${r.slug}`}
            className={
              'whitespace-nowrap pb-[11px] -mb-[13px] border-b-2 transition-colors ' +
              (active
                ? 'text-bordeaux border-bordeaux'
                : 'text-encre-douce border-transparent hover:text-bordeaux')
            }
          >
            {r.title}
          </Link>
        </React.Fragment>
      )
    })}
  </nav>
)

export const CategoriesNav: React.FC<{ categories: Categorie[] }> = ({ categories }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onCatalogue = pathname === '/catalogue'
  const activeSlug = onCatalogue ? (searchParams.get('categorie') ?? searchParams.get('rayon')) : null
  const nouveauteActive = onCatalogue && searchParams.get('nouveaute') === '1'
  return (
    <CategoriesNavLinks categories={categories} activeSlug={activeSlug} nouveauteActive={nouveauteActive} />
  )
}
