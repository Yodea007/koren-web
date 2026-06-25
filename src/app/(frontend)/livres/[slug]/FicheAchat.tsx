'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import { formatPrix, RELIURE_HEX, RELIURE_LABELS } from '@/utilities/koren'
import { useCart } from '@/providers/Cart'

type Declinaison = {
  nom: string
  tome?: number | null
  couleurReliure?: ('bordeaux' | 'marine' | 'vert') | null
  prix?: number | null
  disponible?: boolean | null
}

const ORDRE_COULEURS = ['bordeaux', 'marine', 'vert'] as const

export const FicheAchat: React.FC<{
  declinaisons: Declinaison[]
  prixBase: number
  disponibleBase: boolean
  // Infos livre pour construire la ligne de panier (ref aligné sur articlesDeLivre)
  livreId: number
  slug: string
  titre: string
  isbnBase: string
  imageUrl?: string
}> = ({ declinaisons, prixBase, disponibleBase, livreId, slug, titre, isbnBase, imageUrl }) => {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  // Axe Volume : déclinaisons portant un numéro de tome (dédupliquées)
  const volumes = useMemo(() => {
    const seen = new Set<number>()
    return declinaisons
      .filter((d) => d.tome != null && !seen.has(d.tome) && (seen.add(d.tome), true))
      .sort((a, b) => (a.tome ?? 0) - (b.tome ?? 0))
  }, [declinaisons])

  // Axe Couleur de reliure : valeurs distinctes présentes
  const couleurs = useMemo(
    () => ORDRE_COULEURS.filter((c) => declinaisons.some((d) => d.couleurReliure === c)),
    [declinaisons],
  )

  const [selTome, setSelTome] = useState<number | null>(volumes[0]?.tome ?? null)
  const [selCouleur, setSelCouleur] = useState<string | null>(couleurs[0] ?? null)
  const [qty, setQty] = useState(1)

  // Index de la déclinaison sélectionnée (= index dans livre.declinaisons → ref stable)
  const matchedIndex = useMemo(
    () =>
      declinaisons.findIndex(
        (d) =>
          (volumes.length === 0 || d.tome === selTome) &&
          (couleurs.length === 0 || d.couleurReliure === selCouleur),
      ),
    [declinaisons, volumes.length, couleurs.length, selTome, selCouleur],
  )
  const matched = matchedIndex >= 0 ? declinaisons[matchedIndex] : undefined

  const prix = matched?.prix ?? prixBase
  const disponible = matched ? matched.disponible !== false : disponibleBase

  // ref identique à articlesDeLivre : `livre-{id}` sans déclinaison, `livre-{id}-{i}` sinon
  const ref =
    declinaisons.length > 0 ? `livre-${livreId}-${Math.max(0, matchedIndex)}` : `livre-${livreId}`
  const ligneTitre = matched?.nom ? `${titre} — ${matched.nom}` : titre

  const handleAdd = () => {
    add({ ref, titre: ligneTitre, prixTTC: prix, slug, isbn: isbnBase, imageUrl }, qty)
    setAdded(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {volumes.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[1.5px] text-encre-douce">Volume</p>
          <div className="flex flex-wrap gap-2">
            {volumes.map((v) => (
              <button
                key={v.tome}
                type="button"
                onClick={() => setSelTome(v.tome ?? null)}
                className={
                  'rounded-[5px] border px-4 py-3 text-left font-serif text-sm transition-colors ' +
                  (v.tome === selTome
                    ? 'border-bordeaux bg-bordeaux/5 text-encre'
                    : 'border-ligne text-encre-douce hover:border-encre-pale')
                }
              >
                {v.nom}
              </button>
            ))}
          </div>
        </div>
      )}

      {couleurs.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[1.5px] text-encre-douce">
            Couleur de reliure · <span className="text-or">{RELIURE_LABELS[selCouleur ?? '']}</span>
          </p>
          <div className="flex gap-3">
            {couleurs.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={RELIURE_LABELS[c]}
                onClick={() => setSelCouleur(c)}
                style={{ background: RELIURE_HEX[c] }}
                className={
                  'h-8 w-8 rounded-full ring-offset-2 ring-offset-papier transition ' +
                  (c === selCouleur ? 'ring-2 ring-bordeaux' : 'ring-1 ring-ligne hover:ring-encre-pale')
                }
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex items-center rounded-[5px] border border-ligne">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-3 font-mono text-lg text-encre-douce hover:text-bordeaux"
            aria-label="Diminuer"
          >
            −
          </button>
          <span className="w-8 text-center font-mono">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-4 py-3 font-mono text-lg text-encre-douce hover:text-bordeaux"
            aria-label="Augmenter"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={!disponible}
          onClick={handleAdd}
          className="flex-1 rounded-[5px] bg-bordeaux px-6 py-3 font-mono text-xs uppercase tracking-[1.5px] text-[#f7efe0] transition-colors hover:bg-bordeaux-profond disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disponible ? `Ajouter au panier — ${formatPrix(prix)}` : 'Indisponible'}
        </button>
      </div>

      {added && (
        <p className="-mt-2 font-serif text-sm text-encre-douce">
          ✓ Ajouté au panier.{' '}
          <Link href="/panier" className="text-bordeaux underline underline-offset-4">
            Voir le panier
          </Link>
        </p>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-1 font-serif text-sm text-encre-douce">
        <span>✓ Expédié sous 48 h</span>
        <span>✓ Retour 30 jours</span>
        <span className="text-encre-pale">♡ Ajouter à une liste</span>
      </div>
    </div>
  )
}
