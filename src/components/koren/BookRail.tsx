'use client'

import React, { useRef } from 'react'

/**
 * Rail horizontal défilable (type Netflix) avec flèches ← →.
 * Les cartes (couvertures) sont passées en `children` (rendues côté serveur).
 *
 * Le padding horizontal n'est PAS posé sur l'élément scrollable (sinon il est inclus
 * dans la track de la scrollbar et fausse l'alignement) : on utilise des spacers en
 * début/fin. Avec `gap-5` (20px), un spacer de 44px (md:w-11) place la 1ʳᵉ carte à 64px,
 * aligné sur les titres (px-16) ; sur mobile, le seul gap suffit (20px = px-5).
 */
export const BookRail: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(el.clientWidth - 180, 336), behavior: 'smooth' })
  }

  return (
    <div className="relative mx-auto max-w-[1180px]">
      <div ref={ref} className="koren-rail flex gap-5 overflow-x-auto scroll-smooth pb-4 pt-1.5">
        <div aria-hidden className="w-0 flex-none md:w-11" />
        {children}
        <div aria-hidden className="w-0 flex-none md:w-11" />
      </div>

      <button
        type="button"
        aria-label="Précédent"
        onClick={() => scroll(-1)}
        className="absolute left-4 top-[120px] hidden h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-full border border-[#d8cdb8] bg-carte text-bordeaux shadow-[0_6px_16px_-6px_rgba(40,30,18,.45)] transition-colors hover:border-bordeaux hover:bg-bordeaux hover:text-[#f7efe0] md:flex"
      >
        ←
      </button>
      <button
        type="button"
        aria-label="Suivant"
        onClick={() => scroll(1)}
        className="absolute right-4 top-[120px] hidden h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-full border border-[#d8cdb8] bg-carte text-bordeaux shadow-[0_6px_16px_-6px_rgba(40,30,18,.45)] transition-colors hover:border-bordeaux hover:bg-bordeaux hover:text-[#f7efe0] md:flex"
      >
        →
      </button>
    </div>
  )
}
