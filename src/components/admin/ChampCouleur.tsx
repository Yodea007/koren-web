'use client'

// Champ admin « Couleur du bouton » : ouvre le sélecteur de couleurs natif du navigateur
// (rosace web + pipette pour prélever une teinte sur l'image affichée au-dessus).
// Valeur vide = pas de couleur → le bouton garde son style « verre dépoli ».
import { FieldLabel, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import React from 'react'

const ChampCouleur: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })

  return (
    <div className="field-type" style={{ marginBottom: 'var(--spacing-field, 1.5rem)' }}>
      <FieldLabel label={field.label} path={path} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input
          type="color"
          value={value || '#93142e'}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Choisir la couleur de fond du bouton"
          style={{
            width: 56,
            height: 36,
            padding: 2,
            border: '1px solid var(--theme-elevation-150, #ccc)',
            borderRadius: 4,
            background: 'transparent',
            cursor: 'pointer',
          }}
        />
        <code style={{ fontSize: 13 }}>{value || 'aucune → verre dépoli'}</code>
        {value ? (
          <button
            type="button"
            onClick={() => setValue('')}
            style={{
              border: '1px solid var(--theme-elevation-150, #ccc)',
              borderRadius: 4,
              background: 'transparent',
              padding: '4px 10px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Effacer (revenir au verre dépoli)
          </button>
        ) : null}
      </div>
      <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--theme-elevation-500, #777)' }}>
        Astuce : la pipette du sélecteur permet de prélever une couleur directement sur
        l’image de la diapositive. La couleur du texte (blanc/noir) s’ajuste automatiquement.
      </p>
    </div>
  )
}

export default ChampCouleur
