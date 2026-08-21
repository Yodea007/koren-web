// ┌──────────────────────────────────────────────────────────────────────────┐
// │ FICHE AUTEUR (/nos-auteurs/[slug]). Server Component.                       │
// │ Page complète d'un auteur (collection Auteurs) :                            │
// │ Acheminement :                                                              │
// │   A. Données : l'auteur par son slug + tous ses livres au catalogue         │
// │   B. Rendu : BLOC 1 — photo + nom + biographie (RichText)                   │
// │              BLOC 2 — « Ses ouvrages » : grille de BookCard                 │
// └──────────────────────────────────────────────────────────────────────────┘
import type { Metadata } from 'next'

import configPromise from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { BookCard } from '@/components/koren/BookCard'

export const revalidate = false

type Args = { params: Promise<{ slug?: string }> }

const queryAuteur = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'auteurs',
    limit: 1,
    depth: 1, // peuple la photo
    where: { slug: { equals: slug } },
  })
  return docs[0] ?? null
})

// Toutes les fiches auteurs sont pré-générées au build
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({ collection: 'auteurs', limit: 100, depth: 0 })
  return docs.filter((a) => a.slug).map((a) => ({ slug: a.slug as string }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = '' } = await params
  const auteur = await queryAuteur(decodeURIComponent(slug))
  if (!auteur) return { title: 'Auteur introuvable · Koren France' }
  return {
    title: `${auteur.nom} · Koren France`,
    description: `${auteur.nom} : biographie et ouvrages parus aux éditions Koren France.`,
    alternates: { canonical: `/nos-auteurs/${auteur.slug}` },
  }
}

export default async function FicheAuteur({ params }: Args) {
  const { slug = '' } = await params
  const auteur = await queryAuteur(decodeURIComponent(slug))
  if (!auteur) notFound()

  // ===== A. DONNÉES : ses livres =====
  const payload = await getPayload({ config: configPromise })
  const { docs: livres } = await payload.find({
    collection: 'livres',
    depth: 1,
    limit: 24,
    where: { auteurs: { contains: auteur.id } },
    sort: '-nouveaute',
  })

  const photo = typeof auteur.photo === 'object' && auteur.photo ? (auteur.photo as MediaType) : null

  // ===== B. RENDU =====
  return (
    <div className="px-5 py-12 md:px-16">
      <div className="mx-auto max-w-[1180px]">
        {/* Fil de retour vers la liste */}
        <Link
          href="/nos-auteurs"
          className="font-mono text-[11px] uppercase tracking-[2px] text-encre-douce transition-colors hover:text-bordeaux"
        >
          ← Nos auteurs
        </Link>

        {/* BLOC 1 — Photo + nom + biographie */}
        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
          {photo && (
            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full border border-ligne bg-lin">
              <Media resource={photo} fill imgClassName="object-cover" size="160px" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-[34px] font-bold leading-tight text-encre">
              {auteur.nom}
            </h1>
            {auteur.biographie && (
              <div className="mt-4 max-w-[70ch] font-serif text-[15px] leading-relaxed text-encre-douce">
                <RichText data={auteur.biographie} enableGutter={false} />
              </div>
            )}
          </div>
        </div>

        {/* BLOC 2 — Ses ouvrages (mêmes cartes que l'accueil) */}
        {livres.length > 0 && (
          <section className="mt-14 border-t border-ligne pt-10">
            <h2 className="mb-8 font-display text-[26px] font-bold text-encre">
              {livres.length > 1 ? 'Ses ouvrages' : 'Son ouvrage'}
              <span className="ml-3 font-mono text-[11px] font-normal uppercase tracking-[2px] text-or">
                {livres.length} {livres.length > 1 ? 'titres' : 'titre'}
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {livres.map((l) => (
                <BookCard key={l.id} livre={l} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
