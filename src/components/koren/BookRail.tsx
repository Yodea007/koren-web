'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Rail horizontal défilable (type Netflix) avec flèches ← →.
 * Les cartes (couvertures) sont passées en `children` (rendues côté serveur).
 *
 * Le padding horizontal n'est PAS posé sur l'élément scrollable (sinon il est inclus
 * dans la track de la scrollbar et fausse l'alignement) : on utilise des spacers en
 * début/fin. Avec `gap-5` (20px), un spacer de 44px (md:w-11) place la 1ʳᵉ carte à 64px,
 * aligné sur les titres (px-16) ; sur mobile, le seul gap suffit (20px = px-5).
 *
 * Les flèches sont réactives à l'état de scroll : la gauche n'apparaît qu'une fois
 * défilé, la droite disparaît en fin de course, et aucune flèche si le contenu tient
 * entièrement dans le viewport (rail non scrollable).
 */
export const BookRail: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = ref.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
      ro.disconnect()
    }
  }, [updateScrollState])

  const scroll = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(el.clientWidth - 180, 336), behavior: 'smooth' })
  }

  const arrowBase =
    'absolute top-[120px] hidden h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-full border border-[#d8cdb8] bg-carte text-bordeaux shadow-[0_6px_16px_-6px_rgba(40,30,18,.45)] transition-colors hover:border-bordeaux hover:bg-bordeaux hover:text-[#f7efe0] md:flex'

  return (
    <div className="relative mx-auto max-w-[1180px]">
      <div ref={ref} className="koren-rail flex gap-5 overflow-x-auto scroll-smooth pb-4 pt-1.5">
        <div aria-hidden className="w-0 flex-none md:w-11" />
        {children}
        <div aria-hidden className="w-0 flex-none md:w-11" />
      </div>

      {canScrollLeft && (
        <button type="button" aria-label="Précédent" onClick={() => scroll(-1)} className={`${arrowBase} left-4`}>
          ←
        </button>
      )}
      {canScrollRight && (
        <button type="button" aria-label="Suivant" onClick={() => scroll(1)} className={`${arrowBase} right-4`}>
          →
        </button>
      )}
    </div>
  )
}
