'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import type { MenuSection } from '@/utilities/menu'

// Onglets déroulants du menu (desktop, ≥ lg) : un onglet par groupe du global « Menu »
// (ex. « Éditions Koren », « Aide »), panneau déplié au survol ou au clic.
// Sous lg, ces groupes restent accessibles via le tiroir ☰ (MenuDrawer).
export const MenuDeroulant: React.FC<{ sections: MenuSection[] }> = ({ sections }) => {
  const [ouvert, setOuvert] = useState<string | null>(null)
  const conteneur = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Fermeture au changement de page, à Échap et au clic hors du menu.
  useEffect(() => setOuvert(null), [pathname])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuvert(null)
    }
    const onClick = (e: MouseEvent) => {
      if (conteneur.current && !conteneur.current.contains(e.target as Node)) setOuvert(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [])

  if (sections.length === 0) return null

  return (
    <div ref={conteneur} className="hidden lg:flex items-stretch pr-2">
      {sections.map((s) => {
        const isOpen = ouvert === s.titre
        return (
          <div
            key={s.titre}
            className="relative flex"
            onMouseEnter={() => setOuvert(s.titre)}
            onMouseLeave={() => setOuvert((o) => (o === s.titre ? null : o))}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOuvert(isOpen ? null : s.titre)}
              className={
                'flex items-center gap-1.5 whitespace-nowrap px-4 font-mono text-[13px] font-semibold uppercase tracking-[1.5px] transition-colors ' +
                (isOpen ? 'bg-white text-bordeaux' : 'text-bordeaux hover:bg-white/60')
              }
            >
              {s.titre}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={'h-3.5 w-3.5 transition-transform duration-200 ' + (isOpen ? 'rotate-180' : '')}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Panneau déroulant */}
            <div
              className={
                'absolute right-0 top-full z-50 min-w-[240px] pt-px transition-all duration-150 ' +
                (isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0')
              }
            >
              <ul className="border border-[#dbccae] bg-white py-2 shadow-[0_14px_35px_rgba(43,26,26,0.18)]">
                {s.liens.map((l) => (
                  <li key={l.href + l.intitule}>
                    <Link
                      href={l.href}
                      onClick={() => setOuvert(null)}
                      className="block whitespace-nowrap px-5 py-2.5 font-serif text-[15px] text-encre transition-colors hover:bg-secondary hover:text-bordeaux"
                    >
                      {l.intitule}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}
    </div>
  )
}
