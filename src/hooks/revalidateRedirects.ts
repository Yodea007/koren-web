import type { CollectionAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateRedirects: CollectionAfterChangeHook = ({
  doc,
  req: { context, payload },
}) => {
  // Garde indispensable pour les scripts (hors requête Next, revalidateTag jette
  // et fait annuler la transaction — donc la création du redirect elle-même).
  if (context.disableRevalidate) return doc

  payload.logger.info(`Revalidating redirects`)

  revalidateTag('redirects', 'max')

  return doc
}
