import type { GlobalAfterChangeHook } from 'payload'

import { revalidatePath } from 'next/cache'

// À chaque modification du menu, on rafraîchit tout le site (le menu est dans le layout).
export const revalidateMenu: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating menu')
    revalidatePath('/', 'layout')
  }
  return doc
}
