import Link from 'next/link'
import React from 'react'

import type { Livre } from '@/payload-types'

import { Media } from '@/components/Media'
import { AddToCartButton } from '@/components/koren/AddToCartButton'
import { couverture, eyebrow, formatPrix, languePills } from '@/utilities/koren'
import { articlesDeLivre } from '@/utilities/tarif'

export const BookCard: React.FC<{ livre: Livre }> = ({ livre }) => {
  const href = `/livres/${livre.slug}`
  const cover = couverture(livre)
  const pills = languePills(livre)
  const eb = eyebrow(livre)
  const indisponible = livre.disponible === false

  // Une seule édition vendable → ajout direct ; plusieurs → on renvoie à la fiche pour choisir.
  const articles = articlesDeLivre(livre)
  const articleUnique = articles.length === 1 ? articles[0] : null
  const btnClass =
    'rounded-[5px] border border-bordeaux px-3 py-1.5 font-mono text-[10px] uppercase tracking-[1.5px] text-bordeaux transition-colors hover:bg-bordeaux hover:text-[#f7efe0] disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <article className="flex flex-col">
      <Link href={href} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-lin border border-ligne">
          {cover ? (
            <Media
              resource={cover}
              fill
              size="(max-width: 768px) 45vw, 22vw"
              imgClassName="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center font-display text-lg text-encre-pale">
              {livre.titre}
            </div>
          )}

          {livre.nouveaute && (
            <span className="absolute left-2 top-2 rounded-[3px] border border-bordeaux bg-papier/95 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-bordeaux backdrop-blur-[1px]">
              Nouveauté
            </span>
          )}
          {indisponible && (
            <span className="absolute right-2 top-2 rounded-[3px] border border-[#b9ab8e] bg-papier/95 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-encre-douce backdrop-blur-[1px]">
              Indisponible
            </span>
          )}
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        {eb && <p className="mb-1 font-serif text-sm italic text-encre-douce">{eb}</p>}

        <Link href={href}>
          <h3 className="font-serif text-lg font-medium leading-snug text-encre hover:text-bordeaux">
            {livre.titre}
          </h3>
        </Link>

        {pills.length > 0 && (
          <div className="mt-2">
            <span className="inline-block rounded-[3px] border border-ligne px-1.5 py-0.5 font-mono text-[10px] tracking-[1px] text-encre-douce">
              {pills.join('/')}
            </span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="font-display text-2xl text-bordeaux">{formatPrix(livre.prix)}</span>
          {articleUnique ? (
            <AddToCartButton
              disabled={indisponible}
              className={btnClass}
              line={{
                ref: articleUnique.ref,
                titre: articleUnique.titre,
                prixTTC: articleUnique.prixTTC,
                slug: livre.slug as string,
                isbn: articleUnique.isbn,
                imageUrl: cover?.url ?? undefined,
              }}
            />
          ) : (
            <Link href={href} className={btnClass}>
              Choisir
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
