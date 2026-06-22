'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

/** Une ligne de panier : `ref` = identifiant stable d'article (cf. articlesDeLivre). */
export type CartLine = {
  ref: string
  titre: string
  /** Prix public TTC unitaire au moment de l'ajout (réaffirmé côté serveur au paiement). */
  prixTTC: number
  qte: number
  slug: string
  isbn: string
  imageUrl?: string
}

type CartContextValue = {
  lines: CartLine[]
  /** Nombre total d'articles (somme des quantités). */
  count: number
  /** Sous-total TTC des articles (hors port). */
  sousTotal: number
  add: (line: Omit<CartLine, 'qte'>, qte?: number) => void
  setQte: (ref: string, qte: number) => void
  remove: (ref: string) => void
  clear: () => void
  /** Faux tant que le panier n'est pas relu depuis localStorage (évite les mismatchs SSR). */
  ready: boolean
}

const STORAGE_KEY = 'koren-cart'

const CartContext = createContext<CartContextValue | null>(null)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lines, setLines] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)

  // Relecture initiale depuis localStorage (après montage, jamais au SSR).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setLines(JSON.parse(raw))
    } catch {
      /* panier corrompu → on repart vide */
    }
    setReady(true)
  }, [])

  // Persistance à chaque changement (une fois prêt).
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* quota / mode privé → on ignore */
    }
  }, [lines, ready])

  const add: CartContextValue['add'] = (line, qte = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.ref === line.ref)
      if (i === -1) return [...prev, { ...line, qte }]
      const next = [...prev]
      next[i] = { ...next[i], qte: next[i].qte + qte }
      return next
    })
  }

  const setQte: CartContextValue['setQte'] = (ref, qte) => {
    setLines((prev) =>
      qte <= 0
        ? prev.filter((l) => l.ref !== ref)
        : prev.map((l) => (l.ref === ref ? { ...l, qte } : l)),
    )
  }

  const remove: CartContextValue['remove'] = (ref) =>
    setLines((prev) => prev.filter((l) => l.ref !== ref))

  const clear = () => setLines([])

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qte, 0)
    const sousTotal = lines.reduce((s, l) => s + l.prixTTC * l.qte, 0)
    return { lines, count, sousTotal, add, setQte, remove, clear, ready }
  }, [lines, ready])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans <CartProvider>')
  return ctx
}
