import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { renderTarifPdf } from '@/libraires/BonCommandePdf'
import { articlesParCategorie } from '@/utilities/tarif'

// Tarif libraires vierge, généré à la volée depuis le catalogue (toujours à jour).
// Exposé par la route GET /bon-de-commande.pdf (stub dans src/app/(frontend)/bon-de-commande.pdf/route.ts).
export async function GET(): Promise<Response> {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'livres',
    depth: 1,
    limit: 1000,
    pagination: false,
    overrideAccess: false,
    sort: 'titre',
  })

  const categories = articlesParCategorie(docs)
  const dateStr = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date())
  const pdf = await renderTarifPdf(categories, dateStr)

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="tarif-libraires-koren.pdf"',
      'Cache-Control': 'no-store',
    },
  })
}
