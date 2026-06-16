'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React from 'react'

type Rayon = { title: string; slug: string }

export const RayonsNavLinks: React.FC<{ rayons: Rayon[]; activeSlug: string | null }> = ({
  rayons,
  activeSlug,
}) => (
  <nav className="flex items-center justify-center gap-5 md:gap-[34px] py-3 px-4 bg-secondary border-b border-[#dbccae] font-mono text-[11px] tracking-[1.5px] uppercase overflow-x-auto">
    {rayons.map((r) => {
      const active = r.slug === activeSlug
      return (
        <Link
          key={r.slug}
          href={`/catalogue?rayon=${r.slug}`}
          className={
            'whitespace-nowrap pb-[11px] -mb-[13px] border-b-2 transition-colors ' +
            (active
              ? 'text-bordeaux border-bordeaux'
              : 'text-encre-douce border-transparent hover:text-bordeaux')
          }
        >
          {r.title}
        </Link>
      )
    })}
  </nav>
)

export const RayonsNav: React.FC<{ rayons: Rayon[] }> = ({ rayons }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeSlug = pathname === '/catalogue' ? searchParams.get('rayon') : null
  return <RayonsNavLinks rayons={rayons} activeSlug={activeSlug} />
}
