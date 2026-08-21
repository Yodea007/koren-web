// ┌──────────────────────────────────────────────────────────────────────────┐
// │ PAGE D'ACCUEIL (/). Server Component : tout est rendu côté serveur.         │
// │ Acheminement (lire la fonction Accueil() plus bas) :                        │
// │   A. Récupération des données via Payload (getPayload + payload.find) :     │
// │        • hero (diaporama éditable)   • catégories                            │
// │        • livres par catégorie (rails)  • mise en avant (sélection)               │
// │   B. Rendu des BLOCS dans l'ordre d'affichage :                             │
// │        1. <Hero>              — diaporama plein écran (desktop/tablette ≥ md)│
// │        1bis. liste des rayons — gros titres cliquables (smartphone < md)     │
// │        2. section « rails »   — un <BookSwiper> par catégorie (≥ md)         │
// │        3. section « sélection » — grille de 4 livres curés (toutes tailles) │
// │ Composants clés : <Cover> (couverture + badges), <Hero>, <BookSwiper>.      │
// │ Helpers : auteurNoms(), couverture()/formatPrix() (utilities/koren).        │
// └──────────────────────────────────────────────────────────────────────────┘

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
import { couverture, formatPrix, labelCategorieCourt, ordreCategorie } from '@/utilities/koren'

// Accueil mis en cache, régénéré à la demande (hooks admin sur livres/catégories/hero)
// + filet quotidien via le cron Vercel de minuit (/api/revalidate). Pas de timer glissant.
export const revalidate = false

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
        <span className="absolute left-2 top-2 rounded-[3px] border border-bordeaux bg-papier/95 px-2 py-[3px] font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-bordeaux backdrop-blur-[1px]">
          Nouveauté
        </span>
      )}
      {livre.disponible === false && (
        <span className="absolute right-2 top-2 rounded-[3px] border border-[#b9ab8e] bg-papier/95 px-2 py-[3px] font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-encre-douce backdrop-blur-[1px]">
          Indisponible
        </span>
      )}
    </div>
  )
}

export default async function Accueil() {
  const payload = await getPayload({ config: configPromise })

  // ===== A. DONNÉES (côté serveur, via Payload) =====

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
    // Bouton optionnel posé sur la diapo (position en % définie dans l'admin)
    if (s.bouton && slide.href) {
      slide.bouton = s.bouton
      slide.boutonX = s.boutonX ?? 50
      slide.boutonY = s.boutonY ?? 75
      if (s.boutonCouleur) slide.boutonCouleur = s.boutonCouleur
    }
    heroSlides.push(slide)
  }
  const heroInterval = (heroData?.intervalle ?? 5) * 1000

  // Catégories ordonnées
  const { docs: cats } = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 50,
    select: { title: true, titreCourt: true, slug: true, ordre: true },
  })
  const ordered = cats
    .sort((a, b) => ordreCategorie(a) - ordreCategorie(b))
    .map((c) => ({ title: labelCategorieCourt(c), slug: c.slug as string }))

  // Livres par catégorie (rails)
  const categories = (
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

  // Nombre de nouveautés (pour la ligne « Nouveautés » de la liste des rayons mobile)
  const nbNouveautes = (
    await payload.find({
      collection: 'livres',
      where: { nouveaute: { equals: true } },
      limit: 1,
      depth: 0,
      select: { titre: true },
    })
  ).totalDocs

  // Mise en avant (sélection curée en admin ; sinon repli sur les plus récents)
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

  // ===== B. RENDU (blocs dans l'ordre d'affichage) =====
  return (
    <div>
      {/* h1 unique de l'accueil (lecteurs d'écran + SEO — le visuel est porté par le Hero) */}
      <h1 className="sr-only">Éditions Koren – Bibles, prières et pensée juive</h1>
      {/* BLOC 1 — Diaporama d'accueil (composant client, autoplay), toutes tailles.
          Sur smartphone il s'affiche entier (ratio 7:2, plus de rognage). */}
      <Hero slides={heroSlides} intervalMs={heroInterval} />

      {/* BLOC 1bis — SMARTPHONE : les rayons (mêmes liens que la barre de navigation)
          avec leur nombre de références, à la place des carrousels — aucun swipe. */}
      <nav className="md:hidden bg-white" aria-label="Rayons">
        <ul>
          {[{ title: 'Nouveautés', href: '/catalogue?nouveaute=1', count: nbNouveautes }].concat(
            categories.map((r) => ({
              title: r.title,
              href: `/catalogue?categorie=${r.slug}`,
              count: r.count,
            })),
          ).map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                className="flex items-baseline justify-between gap-4 border-b border-ligne px-5 py-4 transition-colors active:text-bordeaux"
              >
                <span className="font-display text-[21px] font-bold leading-tight tracking-[-0.01em] text-encre">
                  {r.title}
                </span>
                <span className="whitespace-nowrap font-mono text-[12px] font-semibold uppercase tracking-[1.5px] text-bordeaux">
                  {r.count} {r.count > 1 ? 'titres' : 'titre'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* BLOC 2 — PUBLICATIONS : un carrousel (BookSwiper) par catégorie. Desktop/tablette
          uniquement (sur smartphone, les rayons du BLOC 1bis y mènent directement). */}
      <section className="hidden md:block border-y border-ligne bg-white py-12">
        {categories.map((r) => (
          <div key={r.slug} className="first:mt-0 mt-7">
            <div className="mx-auto max-w-[1180px] px-5 pb-3.5 md:px-16">
              <Link
                href={`/catalogue?categorie=${r.slug}`}
                className="group flex items-baseline gap-3 border-b border-bordeaux pb-1.5"
              >
                <h3 className="font-display text-[28px] font-bold leading-none tracking-[-0.01em] text-encre transition-colors group-hover:text-bordeaux">
                  {r.title}
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[2px] text-or">
                  {r.count} {r.count > 1 ? 'titres' : 'titre'}
                </span>
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

      {/* BLOC 3 — MISE EN AVANT : grille de 4 livres curés par les libraires */}
      {selection.length > 0 && (
        <section className="px-5 py-14 md:px-16">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-10 text-center">
              <h2 className="font-display text-[38px] font-medium text-encre">Mise en avant</h2>
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
    title: 'Éditions Koren – Bibles, prières et pensée juive',
    description:
      'Les éditions Koren · Maggid · The Toby Press en français : Tanakh, Siddourim, Talmud, essais et littérature.',
    alternates: { canonical: '/' },
  }
}
