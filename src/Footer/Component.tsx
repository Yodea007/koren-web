import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { labelRayon, ordreRayon } from '@/utilities/koren'
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
  const rayons = categories
    .map((c) => ({ title: labelRayon(c.slug as string, c.title as string), slug: c.slug as string }))
    .sort((a, b) => ordreRayon(a.slug) - ordreRayon(b.slug))

  return (
    <footer className="mt-auto bg-bordeaux text-[#C9BEA8]">
      <div className="mx-auto max-w-[1180px] px-5 pb-10 pt-14 md:px-16">
        <div className="grid grid-cols-1 gap-12 border-b border-bordeaux-profond pb-11 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          {/* Newsletter */}
          <div id="newsletter" className="scroll-mt-28">
            <div className="font-display text-[28px] font-medium text-[#F1E7D2]">La lettre Koren</div>
            <p className="my-3 mb-[18px] max-w-[300px] font-serif text-[15px] leading-relaxed text-[#9c9079]">
              Nouveautés, entretiens d&apos;auteurs et offres réservées. Une fois par mois, sans excès.
            </p>
            <Newsletter />
          </div>

          {/* Les rayons */}
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[2px] text-or-clair">Les rayons</div>
            <div className="flex flex-col gap-[11px] font-serif text-[15px]">
              {rayons.map((r) => (
                <Link
                  key={r.slug}
                  href={`/catalogue?rayon=${r.slug}`}
                  className="text-[#C9BEA8] transition-colors hover:text-[#F1E7D2]"
                >
                  {r.title}
                </Link>
              ))}
            </div>
          </div>

          {/* La maison */}
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[2px] text-or-clair">La maison</div>
            <div className="flex flex-col gap-[11px] font-serif text-[15px] text-[#C9BEA8]">
              {COL_MAISON.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          {/* Aide */}
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[2px] text-or-clair">Aide</div>
            <div className="flex flex-col gap-[11px] font-serif text-[15px] text-[#C9BEA8]">
              <Link href="/libraires" className="transition-colors hover:text-[#F1E7D2]">
                Espace libraires
              </Link>
              {COL_AIDE.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-[22px] font-mono text-[10.5px] uppercase tracking-[1px] text-encre-pale md:flex-row md:items-center md:justify-between">
          <span>© 2026 Koren France · Koren Publishers Jerusalem</span>
          <span>Koren · Maggid · The Toby Press</span>
        </div>
      </div>
    </footer>
  )
}
