'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export type HeroSlide = { src: string; alt: string; href?: string }

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
