'use client'

import { useAllFormFields } from '@payloadcms/ui'
import React from 'react'

type Severity = 'error' | 'warn'
type Check = { msg: string; severity: Severity }

const hasText = (rt: any): boolean => {
  const walk = (n: any): boolean =>
    n?.text?.trim() ? true : Array.isArray(n?.children) ? n.children.some(walk) : false
  return Array.isArray(rt?.root?.children) ? rt.root.children.some(walk) : false
}

const COLORS: Record<Severity | 'ok', string> = {
  error: '#b9302f',
  warn: '#c77d11',
  ok: '#2f6b4f',
}

export const FicheChecklist: React.FC = () => {
  const [fields] = useAllFormFields()
  const val = (path: string): any => fields[path]?.value
  const anyRow = (re: RegExp): boolean =>
    Object.keys(fields).some((k) => re.test(k) && String(fields[k]?.value ?? '').trim() !== '')

  // --- Données obligatoires ---
  const donnees: Check[] = []
  if (!String(val('titre') ?? '').trim()) donnees.push({ msg: 'Titre manquant', severity: 'error' })
  if (val('prix') == null || val('prix') === '') donnees.push({ msg: 'Prix manquant', severity: 'error' })
  if (!String(val('isbn') ?? '').trim() && !anyRow(/^declinaisons\.\d+\.isbn$/))
    donnees.push({ msg: 'ISBN manquant', severity: 'error' })
  if (!hasText(val('description'))) donnees.push({ msg: 'Description manquante', severity: 'error' })
  const images = val('images')
  if (!(Array.isArray(images) && images.length > 0))
    donnees.push({ msg: 'Image manquante', severity: 'error' })
  const poidsVide = val('poids') == null || val('poids') === ''
  if (poidsVide && !anyRow(/^declinaisons\.\d+\.poids$/))
    donnees.push({ msg: 'Poids manquant', severity: 'error' })
  if (!String(val('dimensions') ?? '').trim())
    donnees.push({ msg: 'Dimensions manquantes', severity: 'error' })

  // --- SEO ---
  const seo: Check[] = []
  const t = String(val('meta.title') ?? '').trim().length
  const d = String(val('meta.description') ?? '').trim().length
  if (!t) seo.push({ msg: 'Titre SEO manquant', severity: 'warn' })
  else if (t > 60) seo.push({ msg: `Titre SEO trop long (${t}/60)`, severity: 'warn' })
  else if (t < 50) seo.push({ msg: `Titre SEO trop court (${t}/50)`, severity: 'warn' })
  if (!d) seo.push({ msg: 'Description SEO manquante', severity: 'warn' })
  else if (d > 150) seo.push({ msg: `Description SEO trop longue (${d}/150)`, severity: 'warn' })
  else if (d < 100) seo.push({ msg: `Description SEO trop courte (${d}/100)`, severity: 'warn' })
  if (!val('meta.image')) seo.push({ msg: 'Image de partage manquante', severity: 'warn' })

  const total = donnees.length + seo.length
  const headColor = donnees.length ? COLORS.error : seo.length ? COLORS.warn : COLORS.ok

  const Line: React.FC<{ c: Check }> = ({ c }) => (
    <li style={{ display: 'flex', gap: 6, alignItems: 'baseline', margin: '3px 0' }}>
      <span style={{ color: COLORS[c.severity] }}>{c.severity === 'error' ? '✕' : '!'}</span>
      <span>{c.msg}</span>
    </li>
  )

  return (
    <div
      style={{
        border: `1px solid var(--theme-elevation-150)`,
        borderLeft: `4px solid ${headColor}`,
        borderRadius: 4,
        padding: '10px 12px',
        background: 'var(--theme-elevation-50)',
        fontSize: 13,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: headColor }} />
        {total === 0 ? 'Fiche complète ✓' : `${total} point(s) à corriger`}
      </div>

      {donnees.length > 0 && (
        <>
          <div style={{ marginTop: 8, fontSize: 11, textTransform: 'uppercase', opacity: 0.6 }}>
            Données
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '2px 0 0' }}>
            {donnees.map((c, i) => (
              <Line c={c} key={i} />
            ))}
          </ul>
        </>
      )}

      {seo.length > 0 && (
        <>
          <div style={{ marginTop: 8, fontSize: 11, textTransform: 'uppercase', opacity: 0.6 }}>
            SEO
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '2px 0 0' }}>
            {seo.map((c, i) => (
              <Line c={c} key={i} />
            ))}
          </ul>
        </>
      )}

      {total === 0 && (
        <div style={{ marginTop: 6, opacity: 0.7 }}>
          Tous les champs obligatoires sont remplis et le SEO est optimal.
        </div>
      )}
    </div>
  )
}

export default FicheChecklist
