import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { renderTarifPdf } from '@/components/libraires/BonCommandePdf'
import { articlesParCategorie } from '@/utilities/tarif'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Tarif libraires vierge, généré à la volée depuis le catalogue (toujours à jour).
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
