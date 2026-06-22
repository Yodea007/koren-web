'use client'

import React from 'react'

type Decl = { isbn?: string | null; poids?: number | null }
type Meta = { title?: string | null; description?: string | null; image?: unknown }
type Row = {
  titre?: string | null
  isbn?: string | null
  prix?: number | null
  poids?: number | null
  dimensions?: string | null
  description?: unknown
  images?: unknown[] | null
  declinaisons?: Decl[] | null
  meta?: Meta
}

// Règles SEO du plugin : titre 50-60, description 100-150.
const seoOk = (meta: Meta): boolean => {
  const t = (meta?.title ?? '').trim().length
  const d = (meta?.description ?? '').trim().length
  return t >= 50 && t <= 60 && d >= 100 && d <= 150 && Boolean(meta?.image)
}

// Texte présent dans un richText Lexical ?
const hasText = (rt: any): boolean => {
  const walk = (n: any): boolean =>
    n?.text?.trim() ? true : Array.isArray(n?.children) ? n.children.some(walk) : false
  return Array.isArray(rt?.root?.children) ? rt.root.children.some(walk) : false
}

const evaluate = (row: Row) => {
  const decls = row.declinaisons ?? []
  const manques: string[] = []

  if (!row.titre?.trim()) manques.push('Titre')
  if (row.prix == null) manques.push('Prix')
  if (!row.isbn?.trim() && !decls.some((d) => d?.isbn?.trim())) manques.push('ISBN')
  if (!hasText(row.description)) manques.push('Description')
  if (!(row.images && row.images.length > 0)) manques.push('Image')
  if (row.poids == null && !decls.some((d) => d?.poids != null)) manques.push('Poids')
  if (!row.dimensions?.trim()) manques.push('Dimensions')

  const seo = seoOk(row.meta ?? {})
  return { manques, seo }
}

export const FicheStatusCell: React.FC<{ rowData?: Row }> = ({ rowData }) => {
  const { manques, seo } = evaluate(rowData ?? {})

  let color: string
  let texte: string
  let label: string

  if (manques.length > 0) {
    color = '#b9302f' // rouge — champ obligatoire manquant
    texte = 'Problème'
    label = `Manque : ${manques.join(', ')}${seo ? '' : ' · SEO à améliorer'}`
  } else if (!seo) {
    color = '#c77d11' // orange — données complètes mais SEO perfectible
    texte = 'Moyen'
    label = 'Données complètes · SEO à améliorer (titre 50-60, description 100-150, image)'
  } else {
    color = '#2f6b4f' // vert — tout est bon
    texte = 'Complet'
    label = 'Fiche complète et SEO optimal'
  }

  return (
    <span title={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        aria-hidden
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 12, color: 'var(--theme-elevation-600)' }}>{texte}</span>
    </span>
  )
}

export default FicheStatusCell
