'use client'

import React, { useState } from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'

export const Galerie: React.FC<{ images: MediaType[]; titre: string }> = ({ images, titre }) => {
  const [active, setActive] = useState(0)
  const main = images[active]

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] border border-ligne bg-lin">
        {main ? (
          <Media resource={main} fill size="(max-width: 1024px) 100vw, 40vw" imgClassName="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center font-display text-2xl text-encre-pale">
            {titre}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={img.id ?? i}
              type="button"
              onClick={() => setActive(i)}
              className={
                'relative aspect-[3/4] w-20 overflow-hidden rounded-[2px] border transition-colors ' +
                (i === active ? 'border-bordeaux' : 'border-ligne hover:border-encre-pale')
              }
            >
              <Media resource={img} fill size="80px" imgClassName="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
