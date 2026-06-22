import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

// Sitemap des fiches livres, mis en cache et régénéré à la demande via le tag
// 'livres-sitemap' (hook afterChange/afterDelete sur la collection livres).
const getLivresSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'livres',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    return results.docs
      ? results.docs
          .filter((livre) => Boolean(livre?.slug))
          .map((livre) => ({
            loc: `${SITE_URL}/livres/${livre?.slug}`,
            lastmod: livre.updatedAt || dateFallback,
          }))
      : []
  },
  ['livres-sitemap'],
  {
    tags: ['livres-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getLivresSitemap()

  return getServerSideSitemap(sitemap)
}
