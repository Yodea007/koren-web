// ┌──────────────────────────────────────────────────────────────────────────┐
// │ LAYOUT RACINE — la coquille commune à TOUTES les pages du site public.     │
// │ Acheminement d'une page :                                                  │
// │   1. <html> + polices (Cormorant / Source Serif / Plex Mono)               │
// │   2. JSON-LD global (identité éditeur + recherche) injecté dans le <head>  │
// │   3. <Providers> : Thème + Panier (contexte React partagé par tout le site)│
// │   4. <Header />  → bandeau, logo, icônes, nav rayons   (src/Header)         │
// │   5. <main>{children}</main> → le CONTENU de la page courante              │
// │   6. <Footer />  → liens, newsletter, copyright        (src/Footer)         │
// │ `children` = le rendu de la page appelée (page.tsx du dossier visité).     │
// └──────────────────────────────────────────────────────────────────────────┘

import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { Cormorant, IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google'
import React from 'react'

const cormorant = Cormorant({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
})
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
})

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  // Données structurées globales (identité éditeur + site searchable).
  // Donne aux moteurs et agents IA l'identité de la maison et un point d'entrée recherche.
  const siteUrl = getServerSideURL()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Koren France',
        url: siteUrl,
        logo: `${siteUrl}/koren-logo.png`,
        description:
          'Les éditions Koren · Maggid · The Toby Press en français : Tanakh, Siddourim, Talmud, essais et littérature.',
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'Koren France',
        url: siteUrl,
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'fr-FR',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <html
      className={cn(cormorant.variable, sourceSerif.variable, plexMono.variable)}
      lang="fr"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Providers = contextes globaux (thème + panier). Tout ce qui est dedans
            peut lire le panier via useCart(). */}
        <Providers>
          {/* Barre d'admin (visible seulement en preview / connecté). */}
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header /> {/* En-tête : logo, recherche, panier, newsletter, nav rayons */}
          <main>{children}</main> {/* ← Corps : le contenu de la page courante */}
          <Footer /> {/* Pied : liens, formulaire newsletter, mentions */}
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
