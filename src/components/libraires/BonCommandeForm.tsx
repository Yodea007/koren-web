'use client'

import React, { useMemo, useState } from 'react'

import type { RayonArticles } from '@/utilities/tarif'
import { formatPrix } from '@/utilities/koren'

type Libraire = {
  magasin: string
  nom: string
  email: string
  telephone: string
  adresse: string
}

const champ =
  'w-full rounded-[4px] border border-ligne bg-white px-3 py-2 font-serif text-sm text-encre outline-none focus:border-bordeaux'

export const BonCommandeForm: React.FC<{ rayons: RayonArticles[] }> = ({ rayons }) => {
  const [qte, setQte] = useState<Record<string, number>>({})
  const [remise, setRemise] = useState<number>(0)
  const [libraire, setLibraire] = useState<Libraire>({
    magasin: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const articles = useMemo(() => rayons.flatMap((r) => r.articles), [rayons])

  const { nb, brut } = useMemo(() => {
    let nb = 0
    let brut = 0
    for (const a of articles) {
      const q = qte[a.ref] || 0
      if (q > 0) {
        nb += q
        brut += a.prixTTC * q
      }
    }
    return { nb, brut }
  }, [qte, articles])
  const net = brut * (1 - remise / 100)

  const setQ = (ref: string, v: string) =>
    setQte((s) => ({ ...s, [ref]: Math.max(0, Math.floor(Number(v) || 0)) }))

  const submit = async () => {
    setErrMsg('')
    if (!libraire.magasin.trim() || !libraire.email.trim()) {
      setErrMsg('Renseignez au moins le magasin et l’e-mail.')
      return
    }
    if (nb === 0) {
      setErrMsg('Saisissez au moins une quantité.')
      return
    }
    setStatus('loading')
    try {
      const lignes = articles
        .filter((a) => (qte[a.ref] || 0) > 0)
        .map((a) => ({ ref: a.ref, qte: qte[a.ref] }))
      const res = await fetch('/api/bon-de-commande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libraire, remisePourcent: remise, lignes }),
      })
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(j.error || `Une erreur est survenue (code ${res.status}).`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'bon-commande-koren.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setStatus('done')
    } catch (e) {
      setStatus('error')
      setErrMsg(e instanceof Error ? e.message : 'Une erreur est survenue.')
    }
  }

  return (
    <div>
      {/* Coordonnées */}
      <section className="mb-10 rounded-[6px] border border-ligne bg-carte p-6">
        <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[2px] text-or">Vos coordonnées</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block font-mono text-[11px] uppercase tracking-[1px] text-encre-douce">
              Magasin / enseigne *
            </span>
            <input
              className={champ}
              value={libraire.magasin}
              onChange={(e) => setLibraire({ ...libraire, magasin: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-[11px] uppercase tracking-[1px] text-encre-douce">
              Nom du contact
            </span>
            <input
              className={champ}
              value={libraire.nom}
              onChange={(e) => setLibraire({ ...libraire, nom: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-[11px] uppercase tracking-[1px] text-encre-douce">
              E-mail *
            </span>
            <input
              type="email"
              className={champ}
              value={libraire.email}
              onChange={(e) => setLibraire({ ...libraire, email: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-[11px] uppercase tracking-[1px] text-encre-douce">
              Téléphone
            </span>
            <input
              className={champ}
              value={libraire.telephone}
              onChange={(e) => setLibraire({ ...libraire, telephone: e.target.value })}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block font-mono text-[11px] uppercase tracking-[1px] text-encre-douce">
              Adresse de livraison
            </span>
            <textarea
              className={champ}
              rows={2}
              value={libraire.adresse}
              onChange={(e) => setLibraire({ ...libraire, adresse: e.target.value })}
            />
          </label>
        </div>
      </section>

      {/* Tableaux par rayon */}
      {rayons.map((r) => (
        <section key={r.slug} className="mb-9">
          <h3 className="mb-2 border-b border-bordeaux pb-1.5 font-display text-2xl font-bold text-encre">
            {r.label}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-encre/40 text-left font-mono text-[10px] uppercase tracking-[1px] text-encre-douce">
                  <th className="py-2 pr-3 font-semibold">Titre</th>
                  <th className="px-2 py-2 font-semibold">ISBN</th>
                  <th className="px-2 py-2 text-right font-semibold">Prix TTC</th>
                  <th className="px-2 py-2 text-right font-semibold">/ carton</th>
                  <th className="py-2 pl-2 text-right font-semibold">Qté</th>
                </tr>
              </thead>
              <tbody>
                {r.articles.map((a) => {
                  const q = qte[a.ref] || 0
                  return (
                    <tr
                      key={a.ref}
                      className={'border-b border-ligne ' + (q > 0 ? 'bg-bordeaux/[0.04]' : '')}
                    >
                      <td className="py-2 pr-3 font-serif text-encre">
                        {a.titre}
                        {!a.disponible && (
                          <span className="ml-2 font-mono text-[9px] uppercase tracking-[1px] text-[#b9302f]">
                            indisponible
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 font-mono text-[11px] text-encre-douce">{a.isbn || '—'}</td>
                      <td className="px-2 py-2 text-right font-display text-bordeaux">
                        {formatPrix(a.prixTTC)}
                      </td>
                      <td className="px-2 py-2 text-right font-mono text-[11px] text-encre-douce">
                        {a.parCarton ?? '—'}
                      </td>
                      <td className="py-2 pl-2 text-right">
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={q || ''}
                          onChange={(e) => setQ(a.ref, e.target.value)}
                          className="w-16 rounded-[4px] border border-ligne bg-white px-2 py-1.5 text-right font-mono text-sm text-encre outline-none focus:border-bordeaux"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* Récap + validation (dans le corps de page) */}
      <section className="mt-6 rounded-[6px] border border-ligne bg-carte p-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <label className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[1px] text-encre-douce">
                Remise
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={remise || ''}
                onChange={(e) =>
                  setRemise(Math.min(100, Math.max(0, Math.floor(Number(e.target.value) || 0))))
                }
                className="w-16 rounded-[4px] border border-ligne bg-white px-2 py-1.5 text-right font-mono text-sm outline-none focus:border-bordeaux"
              />
              <span className="font-mono text-sm text-encre-douce">%</span>
            </label>
            <div className="font-mono text-[12px] text-encre-douce">
              {nb} article{nb > 1 ? 's' : ''} · brut {formatPrix(brut)}
            </div>
            <div className="font-display text-2xl font-semibold text-bordeaux">
              Net {formatPrix(net)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {status === 'done' && (
              <span className="font-mono text-[11px] text-[#2f6b4f]">
                Commande envoyée — PDF téléchargé ✓
              </span>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={status === 'loading'}
              className="rounded-full bg-bordeaux px-6 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-papier transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === 'loading' ? 'Envoi…' : 'Valider et télécharger'}
            </button>
          </div>
        </div>
        {errMsg && <p className="mt-3 font-mono text-[11px] text-[#b9302f]">{errMsg}</p>}
      </section>
    </div>
  )
}
