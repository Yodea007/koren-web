import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

import { revalidatePath } from 'next/cache'

// Régénère l'accueil quand une donnée qui l'alimente change (catégories, hero…).
export const revalidateAccueil: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidatePath('/')
  return doc
}

export const revalidateAccueilDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidatePath('/')
  return doc
}

export const revalidateAccueilGlobal: GlobalAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidatePath('/')
  return doc
}
