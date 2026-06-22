import type { Metadata } from 'next'

import configPromise from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import type { Auteur, Lot, Media as MediaType } from '@/payload-types'

import RichText from '@/components/RichText'
import { BookCard } from '@/components/koren/BookCard'
import { formatPrix, languePills, RITE_LABELS } from '@/utilities/koren'
import { getServerSideURL } from '@/utilities/getURL'
import { Galerie } from './Galerie'
import { FicheAchat } from './FicheAchat'

// URL d'image absolue (taille og si dispo) pour partage social / données structurées.
const imageAbsolue = (img?: MediaType | null): string | undefined => {
  if (!img) return undefined
  const rel = img.sizes?.og?.url ?? img.url
  return rel ? getServerSideURL() + rel : undefined
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const livres = await payload.find({
    collection: 'livres',
    limit: 1000,
    pagination: false,
    overrideAccess: false,
    select: { slug: true },
  })
  return livres.docs.map(({ slug }) => ({ slug: slug as string }))
}

type Args = { params: Promise<{ slug?: string }> }

const COUVERTURE_LABEL: Record<string, string> = { rigide: 'Relié', souple: 'Broché' }

export default async function FicheLivre({ params }: Args) {
  const { slug = '' } = await params
  const decodedSlug = decodeURIComponent(slug)
  const livre = await queryLivreBySlug(decodedSlug)

  if (!livre) notFound()

  const images = (livre.images ?? []).filter((i): i is MediaType => typeof i === 'object')
  const auteurs = (livre.auteurs ?? []).filter((a): a is Auteur => typeof a === 'object')
  const declinaisons = (livre.declinaisons ?? []).map((d) => ({
    nom: d.nom,
    tome: d.tome,
    couleurReliure: d.couleurReliure,
    prix: d.prix,
    disponible: d.disponible,
  }))
  const pills = languePills(livre)

  const meta = [
    livre.couverture ? COUVERTURE_LABEL[livre.couverture] : null,
    livre.pages ? `${livre.pages} pages` : null,
    'TTC',
  ]
    .filter(Boolean)
    .join(' · ')

  const lots = (livre.lots?.docs ?? []).filter((l): l is Lot => typeof l === 'object')
  const memeAuteur = auteurs[0] ? await queryMemeAuteur(auteurs[0].id, livre.id) : []

  // Données structurées Product (Google rich results / Shopping)
  const pageUrl = `${getServerSideURL()}/livres/${livre.slug}`
  const descriptionSeo = livre.meta?.description || livre.accroche || undefined
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: livre.titre,
    ...(imageAbsolue(images[0]) ? { image: [imageAbsolue(images[0])] } : {}),
    ...(descriptionSeo ? { description: descriptionSeo } : {}),
    ...(livre.isbn ? { isbn: livre.isbn, gtin13: livre.isbn } : {}),
    ...(auteurs.length > 0
      ? { author: auteurs.map((a) => ({ '@type': 'Person', name: a.nom })) }
      : {}),
    brand: { '@type': 'Brand', name: 'Koren' },
    offers: {
      '@type': 'Offer',
      price: livre.prix,
      priceCurrency: 'EUR',
      availability:
        livre.disponible === false
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      url: pageUrl,
    },
  }

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-12 md:px-[34px] md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,40%)_minmax(0,1fr)] lg:gap-16">
        {/* Galerie */}
        <Galerie images={images} titre={livre.titre} />

        {/* Achat */}
        <div className="flex flex-col gap-6">
          {(livre.rite || pills.length > 0) && (
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[1.5px] text-or">
              {livre.rite && <span>{RITE_LABELS[livre.rite]}</span>}
              {pills.length > 0 && <span className="text-encre-pale">{pills.join('/')}</span>}
            </div>
          )}

          <div>
            <h1 className="font-display text-4xl font-medium leading-tight text-encre md:text-5xl">
              {livre.titre}
            </h1>
            {(auteurs.length > 0 || livre.accroche) && (
              <p className="mt-2 font-serif text-lg italic text-encre-douce">
                {auteurs.map((a) => a.nom).join(', ')}
                {auteurs.length > 0 && livre.accroche ? ' · ' : ''}
                {livre.accroche}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-4 border-b border-ligne pb-5">
            <span className="font-display text-4xl text-bordeaux">{formatPrix(livre.prix)}</span>
            {meta && (
              <span className="font-mono text-[11px] uppercase tracking-[1px] text-encre-pale">{meta}</span>
            )}
          </div>

          <FicheAchat
            declinaisons={declinaisons}
            prixBase={livre.prix}
            disponibleBase={livre.disponible !== false}
          />

          {livre.extraitPdf && typeof livre.extraitPdf === 'object' && livre.extraitPdf.url && (
            <a
              href={livre.extraitPdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif text-sm italic text-bordeaux underline-offset-4 hover:underline"
            >
              Feuilleter un extrait
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {livre.description && (
        <div className="mt-16 max-w-[48rem]">
          <RichText data={livre.description} enableGutter={false} enableProse />
        </div>
      )}

      {/* Cross-sell Lots */}
      {lots.length > 0 && (
        <div className="mt-12 flex flex-col gap-4">
          {lots.map((lot) => {
            const eco =
              lot.modePrix === 'remise' && lot.remisePourcent
                ? `−${lot.remisePourcent} %`
                : lot.modePrix === 'fixe' && lot.prix != null
                  ? formatPrix(lot.prix)
                  : null
            return (
              <div
                key={lot.id}
                className="flex items-center gap-4 rounded-[6px] border border-ligne bg-carte p-5"
              >
                {eco && (
                  <span className="shrink-0 rounded-[3px] bg-bordeaux px-2 py-1 font-mono text-[10px] uppercase tracking-[1.5px] text-[#f7efe0]">
                    Lot {eco}
                  </span>
                )}
                <span className="font-display text-xl text-encre">{lot.titre}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Du même auteur */}
      {memeAuteur.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-display text-3xl font-medium text-encre">Du même auteur</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {memeAuteur.map((l) => (
              <BookCard key={l.id} livre={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = '' } = await params
  const livre = await queryLivreBySlug(decodeURIComponent(slug))
  if (!livre) return { title: 'Livre · Koren France' }

  const url = `${getServerSideURL()}/livres/${livre.slug}`
  const title = livre.meta?.title || `${livre.titre} · Koren France`
  const description =
    livre.meta?.description ||
    livre.accroche ||
    `${livre.titre} — éditions Koren · Maggid · The Toby Press.`

  const metaImg = typeof livre.meta?.image === 'object' ? (livre.meta?.image as MediaType) : null
  const cover = (livre.images ?? []).find((i): i is MediaType => typeof i === 'object') ?? null
  const ogImage = imageAbsolue(metaImg ?? cover)

  const auteurNoms = (livre.auteurs ?? [])
    .filter((a): a is Auteur => typeof a === 'object')
    .map((a) => a.nom)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'book',
      title,
      description,
      url,
      siteName: 'Koren France',
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
      ...(auteurNoms.length > 0 ? { authors: auteurNoms } : {}),
      ...(livre.isbn ? { isbn: livre.isbn } : {}),
    },
  }
}

const queryLivreBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'livres',
    limit: 1,
    pagination: false,
    depth: 2,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] || null
})

async function queryMemeAuteur(auteurId: number, exclureId: number) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'livres',
    depth: 1,
    limit: 4,
    overrideAccess: false,
    where: {
      and: [{ auteurs: { in: [auteurId] } }, { id: { not_equals: exclureId } }],
    },
  })
  return result.docs
}
