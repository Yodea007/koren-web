'use client'

import React from 'react'

import { useCart } from '@/providers/Cart'

/** Pastille dorée du panier dans le header — reflète le nombre d'articles. */
export const CartCount: React.FC = () => {
  const { count, ready } = useCart()
  const display = ready ? count : 0
  return (
    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#e7c56b] px-1 font-mono text-[9px] font-semibold text-bordeaux">
      {display}
    </span>
  )
}

export default CartCount
