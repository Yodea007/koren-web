import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

// Régénère l'accueil + le catalogue quand une donnée qui les alimente change (catégories, hero…).
export const revalidateAccueil: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath('/')
    revalidateTag('catalogue', 'max')
  }
  return doc
}

export const revalidateAccueilDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath('/')
    revalidateTag('catalogue', 'max')
  }
  return doc
}

export const revalidateAccueilGlobal: GlobalAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidatePath('/')
  return doc
}
