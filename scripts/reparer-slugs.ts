// Répare les slugs dont les accents ont été supprimés au lieu d'être translittérés
// (les-surs-weiss → les-soeurs-weiss). Pour chaque slug corrigé, crée une redirection
// (collection Redirects) de l'ancienne URL vers la nouvelle. Idempotent.
// Usage : npx payload run scripts/reparer-slugs.ts [--apply]
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { slugifier } from '../src/utilities/slugifier'

const APPLY = process.argv.includes('--apply') || process.env.APPLY === '1'
const payload = await getPayload({ config })

// L'ancien slugify de Payload (celui qui supprimait les accents). On ne répare un
// slug QUE s'il correspond exactement à cette sortie : preuve qu'il a été
// auto-généré par le bug, et pas choisi à la main (ex. page « contact »).
const ancienSlugify = (val: string): string =>
  val.trim().replace(/ /g, '-').replace(/[^\w-]+/g, '').toLowerCase()

const cibles = [
  { collection: 'livres', champTitre: 'titre', base: '/livres' },
  { collection: 'posts', champTitre: 'title', base: '/posts' },
  { collection: 'pages', champTitre: 'title', base: '' },
] as const

let corriges = 0
for (const { collection, champTitre, base } of cibles) {
  const { docs } = await payload.find({ collection, limit: 500, depth: 0 })
  for (const doc of docs as Array<Record<string, unknown>>) {
    const titre = doc[champTitre] as string | undefined
    const ancien = doc.slug as string | undefined
    if (!titre || !ancien) continue
    if (ancien !== ancienSlugify(titre)) continue // slug choisi à la main : ne pas toucher
    const nouveau = slugifier(titre)
    if (nouveau === ancien) continue
    corriges++
    console.log(`${collection} #${doc.id} : ${ancien} → ${nouveau}${APPLY ? '' : '  (simulation)'}`)
    if (!APPLY) continue

    await payload.update({
      collection,
      id: doc.id as number,
      data: { slug: nouveau },
      context: { disableRevalidate: true },
    })
    try {
      await payload.create({
        collection: 'redirects',
        data: {
          from: `${base}/${ancien}`,
          to: { type: 'custom', url: `${base}/${nouveau}` },
        },
        context: { disableRevalidate: true },
      })
    } catch (e) {
      // revalidateTag hors requête Next, ou redirection déjà existante : non bloquant
      console.warn(`  ⚠ redirection ${base}/${ancien} : ${(e as Error).message.slice(0, 80)}`)
    }
  }
}
console.log(`${corriges} slug(s) ${APPLY ? 'corrigés' : 'à corriger (relancer avec --apply)'}`)
process.exit(0)
