// Recrée les redirections des anciens slugs bogués (accents supprimés) vers les
// slugs corrigés. Déterministe : ancien = sortie de l'ancien slugify sur le titre,
// nouveau = slug actuel. Idempotent (saute les redirections déjà présentes).
// Usage : npx payload run scripts/creer-redirections-slugs.ts
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { slugifier } from '../src/utilities/slugifier'

const payload = await getPayload({ config })

const ancienSlugify = (val: string): string =>
  val.trim().replace(/ /g, '-').replace(/[^\w-]+/g, '').toLowerCase()

const cibles = [
  { collection: 'livres', champTitre: 'titre', base: '/livres' },
  { collection: 'posts', champTitre: 'title', base: '/posts' },
] as const

const { docs: existantes } = await payload.find({ collection: 'redirects', limit: 500, depth: 0 })
const dejaLa = new Set(existantes.map((r) => r.from))

let crees = 0
for (const { collection, champTitre, base } of cibles) {
  const { docs } = await payload.find({ collection, limit: 500, depth: 0 })
  for (const doc of docs as Array<Record<string, unknown>>) {
    const titre = doc[champTitre] as string | undefined
    const nouveau = doc.slug as string | undefined
    if (!titre || !nouveau) continue
    const ancien = ancienSlugify(titre)
    // Seuls les slugs auto-générés puis réparés nous intéressent
    if (ancien === nouveau || nouveau !== slugifier(titre)) continue
    const from = `${base}/${ancien}`
    if (dejaLa.has(from)) continue
    await payload.create({
      collection: 'redirects',
      data: { from, to: { type: 'custom', url: `${base}/${nouveau}` } },
      context: { disableRevalidate: true },
    })
    crees++
    console.log(`${from} → ${base}/${nouveau}`)
  }
}
console.log(`${crees} redirection(s) créée(s)`)
process.exit(0)
