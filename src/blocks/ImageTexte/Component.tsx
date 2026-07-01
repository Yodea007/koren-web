import React from 'react'

import type { ImageTexteBlock as Props } from '@/payload-types'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

// Rendu du bloc « Image + Texte » : côte à côte sur desktop, empilé (image
// au-dessus) sur mobile. `position` inverse l'ordre, `largeur` règle la part de l'image.
export const ImageTexteBlock: React.FC<Props & { disableInnerContainer?: boolean }> = ({
  image,
  position = 'left',
  largeur = 'half',
  richText,
}) => {
  const imgBasis = largeur === 'third' ? 'md:basis-1/3' : 'md:basis-1/2'

  return (
    <div className="container">
      <div
        className={cn(
          'flex flex-col gap-6 md:flex-row md:items-center md:gap-10',
          position === 'right' && 'md:flex-row-reverse',
        )}
      >
        <div className={cn('w-full', imgBasis)}>
          {image && typeof image === 'object' && (
            <Media
              resource={image}
              imgClassName="w-full h-auto rounded-[0.5rem] border border-ligne"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {richText && <RichText data={richText} enableGutter={false} enableProse />}
        </div>
      </div>
    </div>
  )
}
