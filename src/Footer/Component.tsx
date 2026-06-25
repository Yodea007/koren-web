import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { labelCategorie, ordreCategorie } from '@/utilities/koren'
import { Newsletter } from './Newsletter'

const COL_MAISON = ['Histoire depuis 1962', 'Eliyahou Koren', 'Nos auteurs', 'Espace libraires']
const COL_AIDE = ['Livraison & retours', 'Suivi de commande', 'Nous contacter', 'Mentions légales']

export async function Footer() {
  const payload = await getPayload({ config: configPromise })
  const { docs: categories } = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 50,
    select: { title: true, slug: true },
  })
  const cats = categories
    .map((c) => ({ title: labelCategorie(c.slug as string, c.title as string), slug: c.slug as string }))
    .sort((a, b) => ordreCategorie(a.slug) - ordreCategorie(b.slug))

  return (
    <footer className="mt-auto bg-bordeaux-profond text-white">
      <div className="mx-auto max-w-[1180px] px-5 pb-10 pt-14 md:px-16">
        <div className="grid grid-cols-1 gap-12 border-b border-white/20 pb-11 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          {/* Newsletter */}
          <div id="newsletter" className="scroll-mt-28">
            <div className="font-display text-[28px] font-medium text-white">La lettre Koren</div>
            <p className="my-3 mb-[18px] max-w-[300px] font-serif text-[15px] leading-relaxed text-white/80">
              Nouveautés, entretiens d&apos;auteurs et offres réservées. Une fois par mois, sans excès.
            </p>
            <Newsletter />
          </div>

          {/* Les catégories */}
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[2px] text-white/70">Les catégories</div>
            <div className="flex flex-col gap-[11px] font-serif text-[15px]">
              {cats.map((r) => (
                <Link
                  key={r.slug}
                  href={`/catalogue?categorie=${r.slug}`}
                  className="text-white/90 transition-colors hover:text-white"
                >
                  {r.title}
                </Link>
              ))}
            </div>
          </div>

          {/* La maison */}
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[2px] text-white/70">La maison</div>
            <div className="flex flex-col gap-[11px] font-serif text-[15px] text-white/90">
              {COL_MAISON.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          {/* Aide */}
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[2px] text-white/70">Aide</div>
            <div className="flex flex-col gap-[11px] font-serif text-[15px] text-white/90">
              <Link href="/libraires" className="transition-colors hover:text-white">
                Espace libraires
              </Link>
              {COL_AIDE.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-[22px] font-mono text-[10.5px] uppercase tracking-[1px] text-white/70 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Koren France · Koren Publishers Jerusalem</span>
          <span>Koren · Maggid · The Toby Press</span>
        </div>
      </div>
    </footer>
  )
}
