'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import type { MenuSection } from '@/utilities/menu'

// Bouton ☰ ouvrant un panneau latéral avec les sections du menu (éditables dans l'admin,
// global « Menu ») présentées en accordéons.
// Deux emplacements selon la taille (prop `variante`) :
// - « bandeau » : smartphone (< md), dans le bandeau bordeaux à côté du logo ;
// - « barre »   : tablette et desktop (≥ md), à gauche de la barre de catégories.
// Sur smartphone s'ajoutent : une section « Catégories » (Nouveautés + rayons) en tête —
// la barre de catégories est masquée — et les liens Newsletter / Mon compte en pied,
// retirés du bandeau pour ne garder que logo, ☰, recherche et panier.
export const MenuDrawer: React.FC<{
  sections: MenuSection[]
  categories?: { title: string; slug: string }[]
  variante?: 'bandeau' | 'barre'
}> = ({ sections, categories = [], variante = 'bandeau' }) => {
  const [open, setOpen] = useState(false)

  // Section « Catégories » (smartphone uniquement) + sections du global « Menu ».
  const toutes: (MenuSection & { mobileOnly?: boolean })[] = [
    ...(categories.length > 0
      ? [
          {
            titre: 'Catégories',
            mobileOnly: true,
            liens: [
              { intitule: 'Nouveautés', href: '/catalogue?nouveaute=1' },
              ...categories.map((c) => ({ intitule: c.title, href: `/catalogue?categorie=${c.slug}` })),
            ],
          },
        ]
      : []),
    ...sections,
  ]

  // Accordéon : une section dépliée à la fois, la première par défaut.
  const [depliee, setDepliee] = useState<string | null>(toutes[0]?.titre ?? null)

  // Échap pour fermer + blocage du défilement du fond quand le menu est ouvert.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={
          variante === 'bandeau'
            ? 'flex shrink-0 items-center text-[#f3e7cf] transition-opacity hover:opacity-70 md:hidden'
            : 'hidden shrink-0 items-center px-4 text-bordeaux transition-opacity hover:opacity-70 md:flex'
        }
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className="h-[26px] w-[26px]">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay + panneau latéral (toujours monté → transition fluide) */}
      <div
        className={'fixed inset-0 z-[60] ' + (open ? '' : 'pointer-events-none')}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
      >
        <div
          onClick={close}
          className={'absolute inset-0 bg-black/50 transition-opacity duration-300 ' + (open ? 'opacity-100' : 'opacity-0')}
        />
        <div
          className={
            'absolute left-0 top-0 h-full w-[330px] max-w-[85vw] overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ' +
            (open ? 'translate-x-0' : '-translate-x-full')
          }
        >
          <div className="flex items-center justify-between bg-bordeaux px-6 py-4">
            <span className="font-mono text-[11px] uppercase tracking-[2px] text-[#f3e7cf]">Menu</span>
            <button
              type="button"
              aria-label="Fermer le menu"
              onClick={close}
              className="text-[#f3e7cf] transition-opacity hover:opacity-70"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="h-5 w-5">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          {toutes.map((s) => {
            const isOpen = depliee === s.titre
            return (
              <div
                key={s.titre}
                className={
                  'border-t border-ligne first:border-t-0' + (s.mobileOnly ? ' md:hidden' : '')
                }
              >
                {/* Tête d'accordéon : nom du groupe + chevron */}
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setDepliee(isOpen ? null : s.titre)}
                  className={
                    'flex w-full items-center justify-between px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[2px] transition-colors ' +
                    (isOpen ? 'text-bordeaux' : 'text-encre-douce hover:text-bordeaux')
                  }
                >
                  {s.titre}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={'h-4 w-4 transition-transform duration-200 ' + (isOpen ? 'rotate-180 text-or' : '')}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isOpen && (
                  <ul className="flex flex-col gap-2.5 px-6 pb-5">
                    {s.liens.map((l) => (
                      <li key={l.href + l.intitule}>
                        <Link
                          href={l.href}
                          onClick={close}
                          className="block border-l-2 border-[#e3d5b8] pl-3 font-serif text-[15px] text-encre transition-colors hover:border-or hover:text-bordeaux"
                        >
                          {l.intitule}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}

          {/* Liens directs (smartphone uniquement) : newsletter + compte, retirés du bandeau */}
          <div className="border-t border-ligne md:hidden">
            <Link
              href="/#newsletter"
              onClick={close}
              className="flex items-center gap-3 px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[2px] text-encre-douce transition-colors hover:text-bordeaux"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              Newsletter
            </Link>
            <Link
              href="/compte"
              onClick={close}
              className="flex items-center gap-3 border-t border-ligne px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[2px] text-encre-douce transition-colors hover:text-bordeaux"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
              </svg>
              Mon compte
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
