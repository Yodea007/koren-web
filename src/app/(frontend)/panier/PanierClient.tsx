'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import { fraisDePort, PORT_GRATUIT_DES } from '@/utilities/commerce'
import { formatPrix } from '@/utilities/koren'
import { useCart } from '@/providers/Cart'

export const PanierClient: React.FC = () => {
  const { lines, setQte, remove, sousTotal, ready } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const port = fraisDePort(sousTotal)
  const total = sousTotal + port
  const resteAvantGratuit = Math.max(0, PORT_GRATUIT_DES - sousTotal)

  const commander = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lignes: lines.map((l) => ({ ref: l.ref, qte: l.qte })) }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
        return
      }
      setError(data.error || 'Le paiement est momentanément indisponible.')
    } catch {
      setError('Connexion impossible. Réessayez dans un instant.')
    }
    setLoading(false)
  }

  // Avant l'hydratation du panier (localStorage) : on évite tout flash incohérent.
  if (!ready) {
    return <div className="mx-auto max-w-[980px] px-5 py-24 md:px-16" />
  }

  // ===== Panier vide =====
  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-[680px] px-5 py-24 text-center md:px-16">
        <div className="font-mono text-[11px] uppercase tracking-[2.5px] text-or">Votre panier</div>
        <h1 className="mt-3 font-display text-[34px] font-medium text-encre">Votre panier est vide</h1>
        <p className="mx-auto mt-4 max-w-[440px] font-serif text-encre-douce">
          Parcourez le catalogue pour y ajouter des ouvrages.
        </p>
        <Link
          href="/catalogue"
          className="mt-8 inline-block rounded-[3px] border border-bordeaux px-5 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-bordeaux transition-colors hover:bg-bordeaux hover:text-papier"
        >
          Découvrir le catalogue
        </Link>
      </section>
    )
  }

  // ===== Panier rempli =====
  return (
    <section className="mx-auto max-w-[980px] px-5 py-12 md:px-16 md:py-16">
      <div className="font-mono text-[11px] uppercase tracking-[2.5px] text-or">Votre panier</div>
      <h1 className="mt-2 font-display text-4xl font-medium text-encre">Panier</h1>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        {/* Lignes */}
        <div className="flex flex-col divide-y divide-ligne border-y border-ligne">
          {lines.map((l) => (
            <div key={l.ref} className="flex gap-4 py-5">
              <div className="h-24 w-[68px] shrink-0 overflow-hidden rounded-[2px] border border-ligne bg-lin">
                {l.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.imageUrl} alt={l.titre} className="h-full w-full object-cover" />
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <Link href={`/livres/${l.slug}`} className="font-serif text-[15px] font-medium text-encre hover:text-bordeaux">
                  {l.titre}
                </Link>
                <span className="mt-0.5 font-mono text-[11px] text-encre-pale">{formatPrix(l.prixTTC)}</span>

                <div className="mt-auto flex items-center gap-4 pt-3">
                  <div className="flex items-center rounded-[5px] border border-ligne">
                    <button
                      type="button"
                      onClick={() => setQte(l.ref, l.qte - 1)}
                      className="px-3 py-1.5 font-mono text-encre-douce hover:text-bordeaux"
                      aria-label="Diminuer"
                    >
                      −
                    </button>
                    <span className="w-7 text-center font-mono text-sm">{l.qte}</span>
                    <button
                      type="button"
                      onClick={() => setQte(l.ref, l.qte + 1)}
                      className="px-3 py-1.5 font-mono text-encre-douce hover:text-bordeaux"
                      aria-label="Augmenter"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.ref)}
                    className="font-mono text-[11px] uppercase tracking-[1px] text-encre-pale hover:text-bordeaux"
                  >
                    Retirer
                  </button>
                </div>
              </div>

              <div className="font-display text-xl text-encre">{formatPrix(l.prixTTC * l.qte)}</div>
            </div>
          ))}
        </div>

        {/* Récapitulatif */}
        <aside className="h-fit rounded-[6px] border border-ligne bg-carte p-6">
          <h2 className="font-display text-2xl font-medium text-encre">Récapitulatif</h2>

          <dl className="mt-5 flex flex-col gap-2 font-serif text-sm text-encre-douce">
            <div className="flex justify-between">
              <dt>Sous-total</dt>
              <dd className="text-encre">{formatPrix(sousTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Frais de port</dt>
              <dd className="text-encre">{port === 0 ? 'Offert' : formatPrix(port)}</dd>
            </div>
            {resteAvantGratuit > 0 && (
              <p className="mt-1 font-serif text-[12.5px] text-or">
                Plus que {formatPrix(resteAvantGratuit)} pour la livraison offerte.
              </p>
            )}
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-ligne pt-4">
            <span className="font-display text-lg text-encre">Total</span>
            <span className="font-display text-2xl text-bordeaux">{formatPrix(total)}</span>
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[1px] text-encre-pale">TVA 5,5 % incluse</p>

          <button
            type="button"
            onClick={commander}
            disabled={loading}
            className="mt-5 w-full rounded-[5px] bg-bordeaux px-6 py-3 font-mono text-xs uppercase tracking-[1.5px] text-[#f7efe0] transition-colors hover:bg-bordeaux-profond disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Redirection…' : 'Commander'}
          </button>
          {error && <p className="mt-3 font-serif text-sm text-bordeaux">{error}</p>}

          <p className="mt-4 font-serif text-[12.5px] leading-relaxed text-encre-pale">
            Paiement sécurisé par carte (Apple Pay / Google Pay). Vous serez redirigé vers une page
            de paiement Stripe.
          </p>
        </aside>
      </div>
    </section>
  )
}
