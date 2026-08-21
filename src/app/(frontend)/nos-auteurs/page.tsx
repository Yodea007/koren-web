// ┌──────────────────────────────────────────────────────────────────────────┐
// │ NOS AUTEURS (/nos-auteurs). Server Component.                               │
// │ LISTE des auteurs (collection Auteurs) : photo (ou initiales), nom,         │
// │ nombre d'ouvrages parus chez Koren. Chaque carte mène à la fiche complète   │
// │ de l'auteur : /nos-auteurs/[slug] (biographie + ouvrages).                  │
// │ Acheminement :                                                              │
// │   A. Données : auteurs + comptage de leurs livres                           │
// │   B. Rendu : BLOC 1 — titre ; BLOC 2 — grille de cartes auteur              │
// └──────────────────────────────────────────────────────────────────────────┘
import type { Metadata } from 'next'

import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'

export const revalidate = false
export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Nos auteurs · Koren France',
  description:
    'Les auteurs des éditions Koren, Maggid et The Toby Press : Jonathan Sacks, Adin Steinsaltz, Naomi Ragen, Haïm Sabato…',
}

// Initiales pour le médaillon des auteurs sans photo
const initiales = (nom: string): string =>
  nom
    .split(/\s+/)
    .map((m) => m[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

export default async function NosAuteurs() {
  const payload = await getPayload({ config: configPromise })

  // ===== A. DONNÉES : auteurs + nombre d'ouvrages de chacun =====
  const { docs: auteurs } = await payload.find({
    collection: 'auteurs',
    limit: 50,
    depth: 1, // peuple la photo
    sort: 'nom',
  })

  const cartes = await Promise.all(
    auteurs.map(async (a) => {
      const { totalDocs } = await payload.find({
        collection: 'livres',
        limit: 1,
        depth: 0,
        select: { titre: true },
        where: { auteurs: { contains: a.id } },
      })
      return { auteur: a, nbOuvrages: totalDocs }
    }),
  )

  // ===== B. RENDU =====
  return (
    <div className="px-5 py-12 md:px-16">
      <div className="mx-auto max-w-[1180px]">
        {/* BLOC 1 — Titre */}
        <h1 className="mb-12 text-center font-display text-[38px] font-medium text-encre">
          Nos auteurs
        </h1>

        {/* BLOC 2 — Grille de cartes : photo/initiales, nom, nombre d'ouvrages */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {cartes.map(({ auteur: a, nbOuvrages }) => {
            const photo = typeof a.photo === 'object' && a.photo ? (a.photo as MediaType) : null
            return (
              <Link
                key={a.id}
                href={`/nos-auteurs/${a.slug}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative h-32 w-32 overflow-hidden rounded-full border border-ligne bg-lin transition-transform duration-300 group-hover:scale-[1.04]">
                  {photo ? (
                    <Media resource={photo} fill imgClassName="object-cover" size="128px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-[34px] font-semibold text-encre-pale">
                      {initiales(a.nom)}
                    </div>
                  )}
                </div>
                <div className="mt-4 font-display text-[20px] font-bold leading-tight text-encre transition-colors group-hover:text-bordeaux">
                  {a.nom}
                </div>
                <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[2px] text-or">
                  {nbOuvrages} {nbOuvrages > 1 ? 'ouvrages' : 'ouvrage'}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
