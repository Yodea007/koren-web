'use client'

/* Rangée d'icônes « Partager » : WhatsApp, Facebook, X, e-mail, copier le lien,
 * + partage natif du téléphone (Web Share API) quand il est disponible.
 * Utilisée sur la fiche livre et les articles — le lien partagé affiche la carte
 * générée automatiquement (visuel/og). */

import React from 'react'

type Props = {
  url: string
  titre: string
  className?: string
}

const ICONE_CLASSE =
  'flex h-9 w-9 items-center justify-center rounded-full border border-ligne text-encre-douce transition-colors hover:border-bordeaux hover:text-bordeaux'

export const PartageBoutons: React.FC<Props> = ({ url, titre, className }) => {
  const [copie, setCopie] = React.useState(false)
  const [natif, setNatif] = React.useState(false)

  React.useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') setNatif(true)
  }, [])

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopie(true)
      setTimeout(() => setCopie(false), 2000)
    } catch {
      /* clipboard indisponible (http, très vieux navigateur) : rien à faire */
    }
  }

  const partagerNatif = () => {
    navigator.share({ title: titre, url }).catch(() => {})
  }

  const texte = encodeURIComponent(titre)
  const lien = encodeURIComponent(url)

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className ?? ''}`}>
      <span className="mr-1 font-mono text-[11px] uppercase tracking-[1.5px] text-encre-pale">
        Partager
      </span>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${texte}%20${lien}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur WhatsApp"
        title="WhatsApp"
        className={ICONE_CLASSE}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.7l.4-.5c.1-.2.2-.3.3-.5v-.5c0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 1.9 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3Z" />
        </svg>
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${lien}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur Facebook"
        title="Facebook"
        className={ICONE_CLASSE}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.6V4.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.4H7.8V14h2.7v8h3Z" />
        </svg>
      </a>

      {/* X (Twitter) */}
      <a
        href={`https://twitter.com/intent/tweet?text=${texte}&url=${lien}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur X"
        title="X"
        className={ICONE_CLASSE}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.2 2h3.3l-7.3 8.4L22.8 22h-6.7l-5.3-6.9L4.8 22H1.5l7.8-9L1.2 2H8l4.8 6.3L18.2 2Zm-1.2 18h1.8L7 3.9H5L17 20Z" />
        </svg>
      </a>

      {/* E-mail */}
      <a
        href={`mailto:?subject=${texte}&body=${texte}%0A${lien}`}
        aria-label="Partager par e-mail"
        title="E-mail"
        className={ICONE_CLASSE}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </a>

      {/* Copier le lien */}
      <button
        type="button"
        onClick={copier}
        aria-label="Copier le lien"
        title="Copier le lien"
        className={ICONE_CLASSE}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M10 14a4 4 0 0 0 5.7 0l3.6-3.6a4 4 0 1 0-5.7-5.7l-1.7 1.7" />
          <path d="M14 10a4 4 0 0 0-5.7 0l-3.6 3.6a4 4 0 1 0 5.7 5.7l1.7-1.7" />
        </svg>
      </button>

      {/* Partage natif (mobile) */}
      {natif && (
        <button
          type="button"
          onClick={partagerNatif}
          aria-label="Partager…"
          title="Partager…"
          className={ICONE_CLASSE}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="17.5" cy="5.5" r="2.5" />
            <circle cx="17.5" cy="18.5" r="2.5" />
            <path d="m8.3 10.8 7-4M8.3 13.2l7 4" />
          </svg>
        </button>
      )}

      {copie && (
        <span aria-live="polite" className="font-serif text-sm italic text-bordeaux">
          Lien copié ✓
        </span>
      )}
    </div>
  )
}

export default PartageBoutons
