// ┌──────────────────────────────────────────────────────────────────────────┐
// │ NOS AUTEURS (/nos-auteurs). Server Component.                               │
// │ Page dynamique alimentée par la collection Auteurs (remplace l'ancienne     │
// │ page statique « à compléter » — cette route prime sur le catch-all [slug]). │
// │ Acheminement :                                                              │
// │   A. Données : auteurs (collection Auteurs, avec photo) + leurs livres      │
// │   B. Rendu : une section par auteur —                                       │
// │        BLOC 1. photo (si présente) + nom + biographie (RichText)            │
// │        BLOC 2. rangée de ses livres (BookCard, mêmes cartes que l'accueil)  │
// └──────────────────────────────────────────────────────────────────────────┘
import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Livre, Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { BookCard } from '@/components/koren/BookCard'

export const revalidate = false
export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Nos auteurs · Koren France',
  description:
    'Les auteurs des éditions Koren, Maggid et The Toby Press : Jonathan Sacks, Adin Steinsaltz, Naomi Ragen, Haïm Sabato…',
}

export default async function NosAuteurs() {
  const payload = await getPayload({ config: configPromise })

  // ===== A. DONNÉES =====
  const { docs: auteurs } = await payload.find({
    collection: 'auteurs',
    limit: 50,
    depth: 1, // peuple la photo
    sort: 'nom',
  })

  // Les livres de chaque auteur (couvertures peuplées pour les cartes)
  const livresParAuteur = new Map<number, Livre[]>()
  for (const a of auteurs) {
    const { docs } = await payload.find({
      collection: 'livres',
      depth: 1,
      limit: 8,
      where: { auteurs: { contains: a.id } },
      sort: '-nouveaute',
    })
    livresParAuteur.set(a.id as number, docs)
  }

  // ===== B. RENDU =====
  return (
    <div className="px-5 py-12 md:px-16">
      <div className="mx-auto max-w-[1180px]">
        <h1 className="mb-12 text-center font-display text-[38px] font-medium text-encre">
          Nos auteurs
        </h1>

        {auteurs.map((a) => {
          const photo = typeof a.photo === 'object' && a.photo ? (a.photo as MediaType) : null
          const livres = livresParAuteur.get(a.id as number) ?? []
          return (
            <section key={a.id} className="border-t border-ligne py-10 first-of-type:border-t-0">
              {/* BLOC 1 — Photo (optionnelle) + nom + biographie */}
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                {photo && (
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-ligne bg-lin">
                    <Media resource={photo} fill imgClassName="object-cover" size="112px" />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="font-display text-[26px] font-bold text-encre">{a.nom}</h2>
                  {a.biographie && (
                    <div className="mt-3 max-w-[70ch] font-serif text-[15px] leading-relaxed text-encre-douce">
                      <RichText data={a.biographie} enableGutter={false} />
                    </div>
                  )}
                </div>
              </div>

              {/* BLOC 2 — Ses livres au catalogue (mêmes cartes que l'accueil) */}
              {livres.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                  {livres.map((l) => (
                    <BookCard key={l.id} livre={l} />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
