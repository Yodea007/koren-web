/* ┌──────────────────────────────────────────────────────────────────────────┐
 * │ Acheminement — GET /livres/[slug]/visuel/[format]                        │
 * │                                                                          │
 * │ Mini-affiche générée à la volée pour les réseaux sociaux :               │
 * │   1. DONNÉES : livre par slug (Payload) + polices Cormorant (src/fonts)  │
 * │      + couverture (1ʳᵉ image) convertie en data URI                      │
 * │   2. RENDU (ImageResponse / next-og) selon le format :                   │
 * │      · og    1200×630  — carte de lien Facebook/X/WhatsApp (og:image)    │
 * │      · carre 1080×1080 — post Instagram / Facebook                       │
 * │      · story 1080×1920 — story / Reel Instagram                          │
 * │   3. `?dl=1` → téléchargement direct (Content-Disposition)               │
 * └──────────────────────────────────────────────────────────────────────────┘ */

import { readFile } from 'fs/promises'
import path from 'path'

import configPromise from '@payload-config'
import { ImageResponse } from 'next/og'
import { getPayload } from 'payload'
import React from 'react'

import type { Auteur, Livre, Media } from '@/payload-types'

import { getServerSideURL } from '@/utilities/getURL'
import { formatPrix } from '@/utilities/koren'

export const dynamic = 'force-dynamic'

// Charte Koren (cf. globals.css)
const C = {
  bordeaux: '#93142e',
  profond: '#6e1726',
  or: '#c9a96a',
  papier: '#f4ecdb',
}

const FORMATS = {
  og: { w: 1200, h: 630 },
  carre: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
} as const

type Format = keyof typeof FORMATS

// Secours en dev : les fichiers médias vivent sur Vercel Blob en prod ; en local
// (dossier editeur-livres/media absent) on va chercher l'image sur la prod.
const PROD_URL = 'https://koren-web.vercel.app'

// Polices chargées une fois par instance (chemins littéraux → tracés par Vercel)
let policesPromise: Promise<{ regular: Buffer; semibold: Buffer }> | null = null
const chargerPolices = () =>
  (policesPromise ??= Promise.all([
    readFile(path.join(process.cwd(), 'src/fonts/Cormorant-Regular.ttf')),
    readFile(path.join(process.cwd(), 'src/fonts/Cormorant-SemiBold.ttf')),
  ]).then(([regular, semibold]) => ({ regular, semibold })))

// Couverture (1ʳᵉ image du livre) → data URI + ratio, pour un rendu fiable dans satori
type Cover = { src: string; ratio: number }
async function couvertureDataUri(livre: Livre): Promise<Cover | null> {
  const img = (livre.images ?? []).find((i): i is Media => typeof i === 'object')
  if (!img) return null
  // Image originale (portrait, ≤ 2000 px WebP) : le recadrage « og » (paysage) rapetisserait la couverture
  const rel = img.url ?? img.sizes?.og?.url
  if (!rel) return null
  const ratio = img.width && img.height ? img.width / img.height : 0.72

  const charger = async (base: string): Promise<Cover> => {
    const res = await fetch(base + rel)
    if (!res.ok) throw new Error(`couverture ${res.status}`)
    const type = res.headers.get('content-type') ?? 'image/jpeg'
    const buf = Buffer.from(await res.arrayBuffer())
    return { src: `data:${type};base64,${buf.toString('base64')}`, ratio }
  }

  try {
    return await charger(getServerSideURL())
  } catch {
    if (process.env.NODE_ENV === 'development') {
      try {
        return await charger(PROD_URL)
      } catch {
        return null
      }
    }
    return null
  }
}

// Éléments partagés entre les trois formats
const Marque: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      display: 'flex',
      color: C.or,
      fontSize: size,
      letterSpacing: size * 0.35,
      textTransform: 'uppercase',
      fontWeight: 600,
    }}
  >
    Koren France
  </div>
)

const Filet: React.FC<{ width?: number }> = ({ width = 64 }) => (
  <div style={{ display: 'flex', width, height: 2, backgroundColor: C.or }} />
)

const Couverture: React.FC<{ cover: Cover; w: number; h: number }> = ({ cover, w, h }) => {
  // Mockups carrés (grandes marges autour du livre) : on zoome, le cadre masque le débord
  const zoom = cover.ratio >= 0.85 && cover.ratio <= 1.3 ? 1.5 : 1
  return (
    <div
      style={{
        display: 'flex',
        width: w,
        height: h,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cover.src}
        alt=""
        style={{
          width: w * zoom,
          height: h * zoom,
          objectFit: 'contain',
          filter: 'drop-shadow(0px 12px 32px rgba(0,0,0,0.45))',
        }}
      />
    </div>
  )
}

// Compose l'affiche d'un format donné (structure satori : tout conteneur est en flex)
function Affiche({
  format,
  livre,
  cover,
}: {
  format: Format
  livre: Livre
  cover: Cover | null
}) {
  const titre = livre.titre ?? ''
  const accroche = livre.accroche ?? ''
  const auteurs = (livre.auteurs ?? [])
    .filter((a): a is Auteur => typeof a === 'object')
    .map((a) => a.nom)
    .join(' · ')
  const prix = typeof livre.prix === 'number' ? formatPrix(livre.prix) : null
  const site = getServerSideURL().replace(/^https?:\/\//, '')

  const fond = {
    display: 'flex',
    width: '100%',
    height: '100%',
    backgroundImage: `linear-gradient(135deg, ${C.profond} 0%, ${C.bordeaux} 100%)`,
    fontFamily: 'Cormorant',
    color: C.papier,
  } as const

  // Taille de titre adaptée à sa longueur
  const taille = (base: number) => (titre.length > 55 ? base * 0.72 : titre.length > 32 ? base * 0.85 : base)

  if (format === 'og') {
    return (
      <div style={{ ...fond, flexDirection: 'row', alignItems: 'center', padding: 48 }}>
        {cover && <Couverture cover={cover} w={380} h={534} />}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            justifyContent: 'center',
            gap: 20,
            paddingLeft: cover ? 60 : 24,
            paddingRight: 12,
          }}
        >
          <Marque size={22} />
          <Filet />
          <div style={{ display: 'flex', fontSize: taille(60), fontWeight: 600, lineHeight: 1.05 }}>
            {titre}
          </div>
          {accroche && (
            <div style={{ display: 'flex', fontSize: 28, color: C.or }}>{accroche}</div>
          )}
          {auteurs && (
            <div style={{ display: 'flex', fontSize: 24, opacity: 0.9 }}>{auteurs}</div>
          )}
        </div>
      </div>
    )
  }

  if (format === 'carre') {
    return (
      <div
        style={{
          ...fond,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '48px 56px',
          textAlign: 'center',
        }}
      >
        <Marque size={26} />
        {cover && <Couverture cover={cover} w={620} h={560} />}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', fontSize: taille(54), fontWeight: 600, lineHeight: 1.05 }}>
            {titre}
          </div>
          {accroche && (
            <div style={{ display: 'flex', fontSize: 28, color: C.or }}>{accroche}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 24 }}>
            {auteurs && <div style={{ display: 'flex', opacity: 0.9 }}>{auteurs}</div>}
            {prix && (
              <div
                style={{
                  display: 'flex',
                  border: `1.5px solid ${C.or}`,
                  borderRadius: 999,
                  padding: '4px 20px',
                  color: C.or,
                }}
              >
                {prix}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', fontSize: 20, color: C.or, opacity: 0.85 }}>{site}</div>
        </div>
      </div>
    )
  }

  // story 1080×1920
  return (
    <div
      style={{
        ...fond,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '96px 72px',
        textAlign: 'center',
      }}
    >
      <Marque size={32} />
      {cover && <Couverture cover={cover} w={780} h={980} />}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <Filet width={90} />
        <div style={{ display: 'flex', fontSize: taille(68), fontWeight: 600, lineHeight: 1.05 }}>
          {titre}
        </div>
        {accroche && <div style={{ display: 'flex', fontSize: 34, color: C.or }}>{accroche}</div>}
        {auteurs && <div style={{ display: 'flex', fontSize: 30, opacity: 0.9 }}>{auteurs}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 28 }}>
          {prix && (
            <div
              style={{
                display: 'flex',
                border: `1.5px solid ${C.or}`,
                borderRadius: 999,
                padding: '6px 26px',
                color: C.or,
              }}
            >
              {prix}
            </div>
          )}
          <div style={{ display: 'flex', color: C.or, opacity: 0.85 }}>{site}</div>
        </div>
      </div>
    </div>
  )
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; format: string }> },
) {
  const { slug, format } = await params
  if (!(format in FORMATS)) return new Response('Format inconnu', { status: 404 })
  const { w, h } = FORMATS[format as Format]

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'livres',
    limit: 1,
    pagination: false,
    depth: 2,
    where: { slug: { equals: decodeURIComponent(slug) } },
  })
  const livre = docs[0]
  if (!livre) return new Response('Livre introuvable', { status: 404 })

  const [polices, cover] = await Promise.all([chargerPolices(), couvertureDataUri(livre)])

  const dl = new URL(request.url).searchParams.get('dl') === '1'

  return new ImageResponse(<Affiche format={format as Format} livre={livre} cover={cover} />, {
    width: w,
    height: h,
    fonts: [
      { name: 'Cormorant', data: polices.regular, weight: 400, style: 'normal' },
      { name: 'Cormorant', data: polices.semibold, weight: 600, style: 'normal' },
    ],
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      ...(dl
        ? { 'Content-Disposition': `attachment; filename="${slug}-${format}.png"` }
        : {}),
    },
  })
}
