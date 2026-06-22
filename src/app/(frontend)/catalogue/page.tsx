import type { Metadata } from 'next'

import configPromise from '@payload-config'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import React from 'react'

import type { Where } from 'payload'

import { BookCard } from '@/components/koren/BookCard'

const LIMIT = 12

// Données du catalogue mises en cache par rayon / page / nouveautés, rafraîchies à la demande
// via le tag 'catalogue' (hooks admin livres & catégories, bouton et cron de revalidation).
const getCatalogue = (rayon: string, page: number, nouveauteOnly: boolean) =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })

      let rayonTitre: string | null = null
      if (rayon && !nouveauteOnly) {
        const cat = await payload.find({
          collection: 'categories',
          where: { slug: { equals: rayon } },
          limit: 1,
          depth: 0,
        })
        rayonTitre = (cat.docs[0]?.title as string) ?? null
      }

      const where: Where = nouveauteOnly
        ? { nouveaute: { equals: true } }
        : rayon
          ? { 'categories.slug': { equals: rayon } }
          : {}

      const result = await payload.find({
        collection: 'livres',
        depth: 1,
        limit: LIMIT,
        page,
        where,
        overrideAccess: false,
        sort: '-nouveaute',
      })

      return { rayonTitre, result }
    },
    ['catalogue', rayon, String(page), String(nouveauteOnly)],
    { tags: ['catalogue'] },
  )()

type Args = {
  searchParams: Promise<{ rayon?: string; page?: string; nouveaute?: string }>
}

export default async function CataloguePage({ searchParams }: Args) {
  const { rayon, page: pageParam, nouveaute } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const nouveauteOnly = nouveaute === '1'

  const { rayonTitre, result } = await getCatalogue(rayon ?? '', page, nouveauteOnly)

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (nouveauteOnly) params.set('nouveaute', '1')
    else if (rayon) params.set('rayon', rayon)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/catalogue?${qs}` : '/catalogue'
  }

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-12 md:px-[34px] md:py-16">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-ligne pb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[2.5px] text-or">
            {nouveauteOnly ? 'Les dernières parutions' : rayonTitre ? 'Le rayon' : 'Le catalogue'}
          </p>
          <h1 className="mt-2 font-display text-5xl font-medium text-encre">
            {nouveauteOnly ? 'Nouveautés' : (rayonTitre ?? 'Tous les ouvrages')}
          </h1>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[1.5px] text-encre-pale">
          {result.totalDocs} {result.totalDocs > 1 ? 'ouvrages' : 'ouvrage'} · Koren · Maggid · The Toby Press
        </p>
      </header>

      {result.docs.length === 0 ? (
        <p className="py-20 text-center font-serif text-encre-douce">
          {nouveauteOnly ? 'Aucune nouveauté pour le moment.' : 'Aucun ouvrage dans ce rayon.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {result.docs.map((livre) => (
            <BookCard key={livre.id} livre={livre} />
          ))}
        </div>
      )}

      {result.totalPages > 1 && (
        <nav className="mt-14 flex items-center justify-center gap-2 font-mono text-sm">
          {result.hasPrevPage && (
            <Link
              href={buildHref(page - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-ligne text-encre-douce hover:border-bordeaux hover:text-bordeaux"
            >
              ‹
            </Link>
          )}
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref(p)}
              aria-current={p === page ? 'page' : undefined}
              className={
                'flex h-9 w-9 items-center justify-center rounded-[5px] border ' +
                (p === page
                  ? 'border-bordeaux bg-bordeaux text-[#f7efe0]'
                  : 'border-ligne text-encre-douce hover:border-bordeaux hover:text-bordeaux')
              }
            >
              {p}
            </Link>
          ))}
          {result.hasNextPage && (
            <Link
              href={buildHref(page + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-ligne text-encre-douce hover:border-bordeaux hover:text-bordeaux"
            >
              ›
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return { title: 'Catalogue · Koren France' }
}
