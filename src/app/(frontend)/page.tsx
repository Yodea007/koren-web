import type { Metadata } from 'next'

import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { Auteur, Livre } from '@/payload-types'

import { Media } from '@/components/Media'
import { BookSwiper } from '@/components/koren/BookSwiper'
import { Hero, type HeroSlide } from '@/components/koren/Hero'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { couverture, formatPrix, labelRayon, ordreRayon } from '@/utilities/koren'

export const dynamic = 'force-dynamic'

const auteurNoms = (livre: Livre): string =>
  ((livre.auteurs ?? []) as (Auteur | number)[])
    .filter((a): a is Auteur => typeof a === 'object')
    .map((a) => a.nom)
    .join(', ')

// Couverture réutilisable (image uploadée, sinon fallback titre)
const Cover: React.FC<{ livre: Livre; sizes: string }> = ({ livre, sizes }) => {
  const cover = couverture(livre)
  return (
    <div className="relative mb-2 aspect-[2/3] overflow-hidden rounded-[2px] border border-ligne bg-lin">
      {cover ? (
        <Media
          resource={cover}
          fill
          size={sizes}
          imgClassName="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-3 text-center font-display text-base text-encre-pale">
          {livre.titre}
        </div>
      )}
      {livre.nouveaute && (
        <span className="absolute right-1.5 top-1.5 bg-bordeaux px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[1.5px] text-[#f7efe0]">
          Nouveauté
        </span>
      )}
      {livre.disponible === false && (
        <span className="absolute right-1.5 top-1.5 bg-nuit px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[1.5px] text-[#d8cdb8]">
          Indisponible
        </span>
      )}
    </div>
  )
}

export default async function Accueil() {
  const payload = await getPayload({ config: configPromise })

  // Hero (diaporama éditable depuis l'admin)
  const heroData = await payload.findGlobal({ slug: 'hero', depth: 1 })
  const heroSlides: HeroSlide[] = []
  for (const s of heroData?.slides ?? []) {
    const img = typeof s.image === 'object' && s.image ? s.image : null
    if (!img?.url) continue
    const slide: HeroSlide = {
      src: getMediaUrl(img.url, img.updatedAt),
      alt: s.titre || img.alt || '',
    }
    const lien = s.lien
    if (lien && typeof lien === 'object' && lien.value && typeof lien.value === 'object') {
      const slug = (lien.value as { slug?: string }).slug
      if (slug) slide.href = lien.relationTo === 'livres' ? `/livres/${slug}` : `/posts/${slug}`
    } else if (s.lienUrl) {
      slide.href = s.lienUrl
    }
    heroSlides.push(slide)
  }
  const heroInterval = (heroData?.intervalle ?? 5) * 1000

  // Catégories ordonnées
  const { docs: cats } = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 50,
    select: { title: true, slug: true },
  })
  const ordered = cats
    .map((c) => ({ title: labelRayon(c.slug as string, c.title as string), slug: c.slug as string }))
    .sort((a, b) => ordreRayon(a.slug) - ordreRayon(b.slug))

  // Livres par rayon (rails)
  const rayons = (
    await Promise.all(
      ordered.map(async (r) => {
        const res = await payload.find({
          collection: 'livres',
          depth: 1,
          limit: 12,
          sort: '-nouveaute',
          where: { 'categories.slug': { equals: r.slug } },
        })
        return { ...r, count: res.totalDocs, books: res.docs }
      }),
    )
  ).filter((r) => r.books.length > 0)

  const totalOuvrages = rayons.reduce((s, r) => s + r.count, 0)

  // Sélection de la maison (curée en admin ; sinon repli sur les plus récents)
  let selection = (
    await payload.find({
      collection: 'livres',
      depth: 1,
      limit: 4,
      where: { selection: { equals: true } },
    })
  ).docs
  if (selection.length === 0) {
    selection = (
      await payload.find({ collection: 'livres', depth: 1, limit: 4, sort: '-updatedAt' })
    ).docs
  }

  return (
    <div>
      <Hero slides={heroSlides} intervalMs={heroInterval} />

      {/* PUBLICATIONS — rails par rayon */}
      <section className="border-y border-ligne bg-white py-12">
        <div className="mx-auto flex max-w-[1180px] items-baseline justify-between gap-6 px-5 md:px-16">
          <h2 className="font-display text-[34px] font-medium text-encre">Publications</h2>
          <span className="text-right font-mono text-[11px] uppercase tracking-[1.5px] text-or">
            ≈ {totalOuvrages} ouvrages · Koren · Maggid · The Toby Press
          </span>
        </div>

        {rayons.map((r) => (
          <div key={r.slug} className="mt-7">
            <div className="mx-auto flex max-w-[1180px] items-baseline justify-between gap-5 px-5 pb-2.5 md:px-16">
              <Link href={`/catalogue?rayon=${r.slug}`} className="flex items-baseline gap-3 hover:opacity-70">
                <h3 className="font-display text-2xl font-semibold text-encre">
                  {r.title}
                  <span className="ml-2 text-lg text-bordeaux">›</span>
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-or">
                  {r.count} {r.count > 1 ? 'titres' : 'titre'}
                </span>
              </Link>
              <Link
                href={`/catalogue?rayon=${r.slug}`}
                className="whitespace-nowrap font-mono text-[11px] tracking-[1px] text-bordeaux"
              >
                Tout voir →
              </Link>
            </div>

            <BookSwiper>
              {r.books.map((b) => (
                <Link key={b.id} href={`/livres/${b.slug}`} className="group w-[170px] flex-none">
                  <Cover livre={b} sizes="170px" />
                  <div className="font-serif text-sm font-medium leading-tight text-encre">
                    {b.titre}
                  </div>
                  <div className="mt-0.5 font-display text-sm font-semibold text-bordeaux">
                    {formatPrix(b.prix)}
                  </div>
                </Link>
              ))}
            </BookSwiper>
          </div>
        ))}
      </section>

      {/* LA SÉLECTION DE LA MAISON */}
      {selection.length > 0 && (
        <section className="px-5 py-14 md:px-16">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-10 text-center">
              <div className="font-mono text-[11px] uppercase tracking-[2.5px] text-or">
                Choisis par nos libraires
              </div>
              <h2 className="mt-2.5 font-display text-[38px] font-medium text-encre">
                La sélection de la maison
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {selection.map((b) => (
                <div key={b.id} className="flex flex-col">
                  <Link href={`/livres/${b.slug}`} className="group block">
                    <Cover livre={b} sizes="(max-width: 1024px) 45vw, 22vw" />
                  </Link>
                  <div className="font-serif text-sm italic text-encre-douce">{auteurNoms(b)}</div>
                  <Link href={`/livres/${b.slug}`}>
                    <div className="font-display text-xl font-semibold leading-tight text-encre hover:text-bordeaux">
                      {b.titre}
                    </div>
                  </Link>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-display text-lg font-semibold text-bordeaux">
                      {formatPrix(b.prix)}
                    </span>
                    <Link
                      href={`/livres/${b.slug}`}
                      className="rounded-[3px] border border-[#d8cdb8] px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[1px] text-encre-douce hover:border-bordeaux hover:text-bordeaux"
                    >
                      Ajouter
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Koren France · Bibles, prières et pensée juive',
    description:
      'Les éditions Koren · Maggid · The Toby Press en français : Tanakh, Siddourim, Talmud, essais et littérature.',
  }
}
