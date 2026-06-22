'use client'

import { Button } from '@payloadcms/ui'
import React, { useState } from 'react'

// Bouton « Rafraîchir le site » : force la revalidation du cache front à la demande.
// (Normalement inutile : chaque enregistrement régénère déjà les pages concernées.)
const RevalidateButton: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const refresh = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/revalidate', { method: 'POST', credentials: 'include' })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <Button buttonStyle="secondary" onClick={refresh} disabled={status === 'loading'}>
        {status === 'loading' ? 'Rafraîchissement…' : 'Rafraîchir le site'}
      </Button>
      {status === 'done' && (
        <span style={{ marginLeft: '0.75rem', color: 'var(--theme-success-500)' }}>
          Site rafraîchi ✓
        </span>
      )}
      {status === 'error' && (
        <span style={{ marginLeft: '0.75rem', color: 'var(--theme-error-500)' }}>
          Échec — réessayez.
        </span>
      )}
      <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>
        Force la mise à jour du site public. Inutile en temps normal : chaque enregistrement
        l’actualise déjà automatiquement.
      </p>
    </div>
  )
}

export default RevalidateButton
