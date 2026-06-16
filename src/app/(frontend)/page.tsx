import type { Metadata } from 'next'

import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { Auteur, Livre } from '@/payload-types'

import { Media } from '@/components/Media'
import { BookRail } from '@/components/koren/BookRail'
import { couverture, formatPrix, labelRayon, ordreRayon } from '@/utilities/koren'

export const dynamic = 'force-dynamic'

const PRESSE = [
  { citation: 'Une lumière pour notre nation.', source: 'Le Roi Charles III' },
  { citation: 'La précision textuelle faite référence.', source: 'Tribune Juive' },
  { citation: 'Des éditions d’une élégance rare.', source: 'Actualité Juive' },
]

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

  // Hero : nouveauté (sinon le plus récent)
  const nouv = await payload.find({
    collection: 'livres',
    depth: 2,
    limit: 1,
    sort: '-updatedAt',
    where: { nouveaute: { equals: true } },
  })
  const hero =
    nouv.docs[0] ??
    (await payload.find({ collection: 'livres', depth: 2, limit: 1, sort: '-updatedAt' })).docs[0] ??
    null

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
      {/* HERO — la nouveauté de la maison */}
      {hero && (
        <section className="bg-lin">
          <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-9 px-5 py-8 md:grid-cols-[150px_1fr] md:px-16">
            <Link href={`/livres/${hero.slug}`} className="group block w-[150px] justify-self-center md:justify-self-start">
              <Cover livre={hero} sizes="150px" />
            </Link>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-[2.5px] text-bordeaux">
                La nouveauté de la maison
              </div>
              <h1 className="mt-1.5 font-display text-[33px] font-medium leading-[1.05] text-encre">
                {hero.titre}
              </h1>
              {(auteurNoms(hero) || hero.accroche) && (
                <div className="mt-1 font-serif text-[15px] italic text-encre-douce">
                  {auteurNoms(hero)}
                  {auteurNoms(hero) && hero.accroche ? ' · ' : ''}
                  {hero.accroche}
                </div>
              )}
              {hero.accroche && (
                <p className="mt-2.5 max-w-[540px] font-serif text-sm leading-relaxed text-[#4d4234]">
                  {hero.accroche}
                </p>
              )}
              <div className="mt-[18px] flex flex-wrap items-center gap-[18px]">
                <span className="font-display text-[26px] font-semibold text-encre">
                  {formatPrix(hero.prix)}
                </span>
                <Link
                  href={`/livres/${hero.slug}`}
                  className="rounded-[4px] bg-bordeaux px-[22px] py-[11px] font-mono text-[11px] uppercase tracking-[1.5px] text-[#fbf6ec] transition-colors hover:bg-bordeaux-profond"
                >
                  Ajouter au panier
                </Link>
                {hero.extraitPdf && typeof hero.extraitPdf === 'object' && hero.extraitPdf.url && (
                  <a
                    href={hero.extraitPdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif text-sm italic text-encre-douce underline underline-offset-[3px]"
                  >
                    Feuilleter un extrait
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PUBLICATIONS — rails par rayon */}
      <section className="border-y border-ligne bg-carte py-12">
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

            <BookRail>
              {r.books.map((b) => (
                <Link key={b.id} href={`/livres/${b.slug}`} className="group w-[148px] flex-none">
                  <Cover livre={b} sizes="148px" />
                  <div className="font-display text-base font-semibold leading-tight text-encre">
                    {b.titre}
                  </div>
                  <div className="mt-0.5 font-display text-sm font-semibold text-bordeaux">
                    {formatPrix(b.prix)}
                  </div>
                </Link>
              ))}
            </BookRail>
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

      {/* PRESSE */}
      <section className="bg-encre px-5 py-14 text-[#E7DEC9] md:px-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-1.5 font-display text-6xl leading-none text-or">“</div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {PRESSE.map((p) => (
              <div key={p.source} className="border-l border-[#4a4030] pl-6">
                <div className="font-display text-[25px] font-normal italic leading-snug text-[#F1E7D2]">
                  {p.citation}
                </div>
                <div className="mt-3.5 font-mono text-[11px] uppercase tracking-[1.5px] text-or">
                  — {p.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
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
