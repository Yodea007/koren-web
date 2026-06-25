'use client'

import { useEffect } from 'react'

import { useCart } from '@/providers/Cart'

// Vide le panier après un paiement réussi (monté sur la page « merci »).
export const ClearCart: React.FC = () => {
  const { clear, ready } = useCart()
  useEffect(() => {
    if (ready) clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])
  return null
}
