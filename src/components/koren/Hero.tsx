'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export type HeroSlide = {
  src: string
  alt: string
  href?: string
  /** Texte du bouton posé sur la diapo ; absent = diapo simplement cliquable */
  bouton?: string
  boutonX?: number
  boutonY?: number
  /** Couleur de fond choisie dans l'admin ; absente = style « verre dépoli » */
  boutonCouleur?: string
}

// Blanc ou noir selon la luminosité du fond, pour que le texte reste lisible
function couleurTexte(hex: string): string {
  const n = hex.replace('#', '')
  const r = parseInt(n.slice(0, 2), 16)
  const g = parseInt(n.slice(2, 4), 16)
  const b = parseInt(n.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#22201d' : '#ffffff'
}

export const Hero: React.FC<{ slides: HeroSlide[]; intervalMs?: number }> = ({
  slides,
  intervalMs = 5000,
}) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), intervalMs)
    return () => clearInterval(t)
  }, [slides.length, intervalMs])

  if (slides.length === 0) return null

  return (
    <section className="relative w-full overflow-hidden bg-lin aspect-[2/1] sm:aspect-[7/2]">
      {slides.map((s, i) => {
        const img = (
          <Image
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            quality={70}
            sizes="100vw"
            className="object-cover"
          />
        )
        return (
          <div
            key={i}
            className={
              'absolute inset-0 transition-opacity duration-1000 ' +
              (i === index ? 'z-[1] opacity-100' : 'z-0 opacity-0 pointer-events-none')
            }
          >
            {s.href ? (
              <Link href={s.href} className="block h-full w-full">
                {img}
                {/* Bouton optionnel : position en % + couleur de fond choisies dans l'admin */}
                {s.bouton && (
                  <span
                    className={
                      'absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-[3px] px-4 py-2 font-mono text-[10px] uppercase tracking-[1.5px] sm:px-5 sm:py-2.5 sm:text-[11px] ' +
                      (s.boutonCouleur
                        ? 'shadow-md transition-opacity hover:opacity-85'
                        : 'border border-white/50 bg-white/10 text-white backdrop-blur-md transition-colors [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] hover:border-white/80 hover:bg-white/25')
                    }
                    style={{
                      left: `${s.boutonX ?? 50}%`,
                      top: `${s.boutonY ?? 75}%`,
                      ...(s.boutonCouleur
                        ? { backgroundColor: s.boutonCouleur, color: couleurTexte(s.boutonCouleur) }
                        : {}),
                    }}
                  >
                    {s.bouton}
                  </span>
                )}
              </Link>
            ) : (
              img
            )}
          </div>
        )
      })}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-[2] flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Visuel ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className="group flex h-6 w-6 items-center justify-center"
            >
              <span
                className={
                  'h-2 w-2 rounded-full transition-colors ' +
                  (i === index ? 'bg-white' : 'bg-white/50 group-hover:bg-white/80')
                }
              />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
