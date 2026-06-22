'use client'

import React from 'react'

// Règles du plugin SEO : titre 50-60, description 100-150 caractères.
const TITLE_MIN = 50
const TITLE_MAX = 60
const DESC_MIN = 100
const DESC_MAX = 150

type Meta = { title?: string | null; description?: string | null; image?: unknown }

type Issue = { msg: string; severity: 'error' | 'warn' }

const evaluate = (meta: Meta): Issue[] => {
  const issues: Issue[] = []
  const t = (meta.title ?? '').trim().length
  const d = (meta.description ?? '').trim().length

  if (!t) issues.push({ msg: 'Titre manquant', severity: 'error' })
  else if (t > TITLE_MAX) issues.push({ msg: `Titre trop long (${t})`, severity: 'warn' })
  else if (t < TITLE_MIN) issues.push({ msg: `Titre trop court (${t})`, severity: 'warn' })

  if (!d) issues.push({ msg: 'Description manquante', severity: 'error' })
  else if (d > DESC_MAX) issues.push({ msg: `Description trop longue (${d})`, severity: 'warn' })
  else if (d < DESC_MIN) issues.push({ msg: `Description trop courte (${d})`, severity: 'warn' })

  if (!meta.image) issues.push({ msg: 'Image de partage manquante', severity: 'warn' })

  return issues
}

export const SeoStatusCell: React.FC<{ rowData?: { meta?: Meta } }> = ({ rowData }) => {
  const issues = evaluate(rowData?.meta ?? {})
  const hasError = issues.some((i) => i.severity === 'error')
  const ok = issues.length === 0

  const color = ok ? '#2f6b4f' : hasError ? '#b9302f' : '#c77d11'
  const label = ok ? 'SEO complet' : issues.map((i) => i.msg).join(' · ')

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
      <span style={{ fontSize: 12, color: 'var(--theme-elevation-600)' }}>
        {ok ? 'OK' : `${issues.length} pb`}
      </span>
    </span>
  )
}

export default SeoStatusCell
