'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { NAV_AIDE, NAV_EDITIONS, type NavLink } from '@/utilities/nav'

// Bouton ☰ (toutes tailles) ouvrant un panneau latéral avec les sections
// secondaires : « Éditions Koren » + « Aide ». (Les catégories restent dans
// la barre de navigation dédiée, sous le bandeau.)
export const MenuDrawer: React.FC = () => {
  const [open, setOpen] = useState(false)

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

  const Section: React.FC<{ titre: string; links: NavLink[] }> = ({ titre, links }) => (
    <div className="border-t border-ligne px-6 py-5 first:border-t-0">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[2px] text-or">{titre}</div>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              onClick={close}
              className="font-serif text-[15px] text-encre transition-colors hover:text-bordeaux"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center px-4 text-bordeaux transition-opacity hover:opacity-70"
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

          <Section titre="Éditions Koren" links={NAV_EDITIONS} />
          <Section titre="Aide" links={NAV_AIDE} />
        </div>
      </div>
    </>
  )
}
