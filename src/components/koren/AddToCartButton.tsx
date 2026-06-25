'use client'

import React, { useState } from 'react'

import type { CartLine } from '@/providers/Cart'
import { useCart } from '@/providers/Cart'

// Bouton « Ajouter » des cartes produit (catalogue, du même auteur…).
// Reçoit une ligne déjà calculée (ref aligné sur articlesDeLivre) et l'ajoute au panier.
export const AddToCartButton: React.FC<{
  line: Omit<CartLine, 'qte'>
  disabled?: boolean
  className?: string
}> = ({ line, disabled = false, className = '' }) => {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  const onClick = () => {
    add(line, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button type="button" disabled={disabled} onClick={onClick} className={className}>
      {disabled ? 'Indisponible' : added ? 'Ajouté ✓' : 'Ajouter'}
    </button>
  )
}
