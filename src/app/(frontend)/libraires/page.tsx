import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { BonCommandeForm } from '@/components/libraires/BonCommandeForm'
import { articlesParRayon } from '@/utilities/tarif'

export const dynamic = 'force-dynamic'

export default async function LibrairesPage() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'livres',
    depth: 1,
    limit: 1000,
    pagination: false,
    overrideAccess: false,
    sort: 'titre',
  })
  const rayons = articlesParRayon(docs)

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-12 md:px-16 md:py-16">
      <header className="mb-10 border-b border-ligne pb-8">
        <p className="font-mono text-[11px] uppercase tracking-[2.5px] text-or">Espace libraires</p>
        <h1 className="mt-2 font-display text-5xl font-medium text-encre">Tarif & bon de commande</h1>
        <p className="mt-4 max-w-[640px] font-serif text-[15px] leading-relaxed text-encre-douce">
          Saisissez vos quantités et votre taux de remise directement ci-dessous, puis validez :
          votre bon de commande PDF est généré et une copie nous est transmise. Vous préférez le papier ?
          Téléchargez le tarif vierge, annotez-le et renvoyez-le-nous.
        </p>
        <a
          href="/bon-de-commande.pdf"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-bordeaux px-5 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-bordeaux transition-colors hover:bg-bordeaux hover:text-papier"
        >
          ↓ Télécharger le tarif (PDF)
        </a>
      </header>

      <BonCommandeForm rayons={rayons} />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Espace libraires · Koren France',
    description: 'Tarif et bon de commande pour les libraires — Koren · Maggid · The Toby Press.',
  }
}
