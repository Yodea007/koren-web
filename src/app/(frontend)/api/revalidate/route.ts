import configPromise from '@payload-config'
import { revalidatePath, revalidateTag } from 'next/cache'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Revalidation à la demande de tout le site.
// Autorisé si : (a) appel du cron Vercel (Authorization: Bearer CRON_SECRET), ou
//               (b) administrateur connecté (cookie de session Payload).
async function handle(req: Request): Promise<Response> {
  const authHeader = req.headers.get('authorization')
  const cronOk = Boolean(process.env.CRON_SECRET) && authHeader === `Bearer ${process.env.CRON_SECRET}`

  let userOk = false
  if (!cronOk) {
    try {
      const payload = await getPayload({ config: configPromise })
      const { user } = await payload.auth({ headers: await nextHeaders() })
      userOk = Boolean(user)
    } catch {
      userOk = false
    }
  }

  if (!cronOk && !userOk) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  // 'layout' sur '/' = rafraîchit tout le site (accueil, fiches, pages, blog) ;
  // + le tag 'catalogue' pour les données mises en cache du catalogue.
  revalidatePath('/', 'layout')
  revalidateTag('catalogue', 'max')

  return Response.json({ revalidated: true, scope: 'site', via: cronOk ? 'cron' : 'admin' })
}

export const GET = handle
export const POST = handle
