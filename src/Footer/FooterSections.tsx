'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import type { MenuSection } from '@/utilities/menu'

// Colonnes de liens du footer (catégories + groupes du global « Menu »).
// Sur smartphone (< md) : accordéons repliés (une section ouverte à la fois),
// comme le tiroir ☰ du header. Sur md+ : colonnes classiques toujours dépliées.
export const FooterSections: React.FC<{ sections: MenuSection[] }> = ({ sections }) => {
  const [ouverte, setOuverte] = useState<string | null>(null)

  return (
    <>
      {sections.map((s) => {
        const isOpen = ouverte === s.titre
        return (
          <div key={s.titre} className="border-t border-white/15 md:border-0">
            {/* Tête d'accordéon (mobile) */}
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOuverte(isOpen ? null : s.titre)}
              className="flex w-full items-center justify-between py-4 font-mono text-[10px] uppercase tracking-[2px] text-white/70 transition-colors hover:text-white md:hidden"
            >
              {s.titre}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={'h-4 w-4 transition-transform duration-200 ' + (isOpen ? 'rotate-180' : '')}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {/* Intitulé fixe (md+) */}
            <div className="mb-4 hidden font-mono text-[10px] uppercase tracking-[2px] text-white/70 md:block">
              {s.titre}
            </div>

            <div
              className={
                (isOpen ? 'flex' : 'hidden') +
                ' flex-col gap-[11px] pb-5 font-serif text-[15px] text-white/90 md:flex md:pb-0'
              }
            >
              {s.liens.map((l) => (
                <Link
                  key={l.href + l.intitule}
                  href={l.href}
                  className="transition-colors hover:text-white"
                >
                  {l.intitule}
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
