import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Livre } from '@/payload-types'

// Régénère l'accueil + la fiche du livre + le catalogue dès qu'un livre change dans l'admin.
export const revalidateLivre: CollectionAfterChangeHook<Livre> = ({
  doc,
  previousDoc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath('/')
    revalidateTag('catalogue', 'max')
    if (doc?.slug) revalidatePath(`/livres/${doc.slug}`)
    if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
      revalidatePath(`/livres/${previousDoc.slug}`)
    }
    payload.logger.info(`Revalidation accueil + fiche livre + catalogue (${doc?.slug ?? doc?.id})`)
  }
  return doc
}

export const revalidateLivreDelete: CollectionAfterDeleteHook<Livre> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath('/')
    revalidateTag('catalogue', 'max')
    if (doc?.slug) revalidatePath(`/livres/${doc.slug}`)
  }
  return doc
}
