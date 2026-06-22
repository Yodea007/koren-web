'use client'

import React, { useState } from 'react'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper/types'
import 'swiper/css'
import 'swiper/css/pagination'

/**
 * Alternative à BookRail basée sur Swiper.js (comme gallimard.fr) :
 * glissement inertiel, snap, léger « peek » sur la slide suivante, flèches qui paginent.
 * Prend les cartes en `children` (rendues côté serveur), comme BookRail.
 */
export const BookSwiper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = (s: SwiperClass) => {
    setAtStart(s.isBeginning)
    setAtEnd(s.isEnd)
  }

  const items = React.Children.toArray(children)

  const arrowBase =
    'absolute top-[135px] hidden h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-full border border-[#d8cdb8] bg-carte text-bordeaux shadow-[0_6px_16px_-6px_rgba(40,30,18,.45)] transition-colors hover:border-bordeaux hover:bg-bordeaux hover:text-[#f7efe0] disabled:opacity-0 md:flex'

  return (
    <div className="relative mx-auto max-w-[1180px] px-5 md:px-16">
      <Swiper
        modules={[Pagination]}
        onSwiper={(s) => {
          setSwiper(s)
          sync(s)
        }}
        onSlideChange={sync}
        onResize={sync}
        onReachBeginning={sync}
        onReachEnd={sync}
        slidesPerView="auto"
        slidesPerGroupAuto
        spaceBetween={20}
        grabCursor
        pagination={{ clickable: true, dynamicBullets: true }}
        style={
          {
            '--swiper-pagination-color': '#93142e',
            '--swiper-pagination-bullet-inactive-color': '#d8cdb8',
            '--swiper-pagination-bullet-inactive-opacity': '1',
            '--swiper-pagination-bottom': '0px',
          } as React.CSSProperties
        }
        className="!pt-1.5 !pb-9"
      >
        {items.map((child, i) => (
          // mr-5 (= 20px, valeur de spaceBetween) réservé dès le SSR : sans lui,
          // Swiper ajoute la marge à l'hydratation et décale les cartes → CLS.
          <SwiperSlide key={i} className="!mr-5 !w-[170px]">
            {child}
          </SwiperSlide>
        ))}
      </Swiper>

      {!atStart && (
        <button
          type="button"
          aria-label="Précédent"
          onClick={() => swiper?.slidePrev()}
          className={`${arrowBase} left-0`}
        >
          ←
        </button>
      )}
      {!atEnd && (
        <button
          type="button"
          aria-label="Suivant"
          onClick={() => swiper?.slideNext()}
          className={`${arrowBase} right-0`}
        >
          →
        </button>
      )}
    </div>
  )
}
