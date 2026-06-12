// Remplit poids (depuis Shopify, champ grams) et couverture (quand le titre l'indique).
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

const products = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'editeur-livres/shopify/products.json'), 'utf8'),
)
const payload = await getPayload({ config })

for (const p of products) {
  const { docs } = await payload.find({
    collection: 'livres',
    where: { shopifyHandle: { equals: p.handle } },
    limit: 1,
  })
  const livre = docs[0]
  if (!livre) continue

  const poidsBase = p.variants[0].grams || undefined
  const titre = p.title.toLowerCase()
  const couverture = /couverture souple/.test(titre)
    ? 'souple'
    : /couverture rigide/.test(titre)
      ? 'rigide'
      : undefined

  const declinaisons = livre.declinaisons?.map((d: any) => {
    const v = p.variants.find((v: any) => v.title === d.nom)
    return v && v.grams && v.grams !== poidsBase ? { ...d, poids: v.grams } : d
  })

  await payload.update({
    collection: 'livres',
    id: livre.id,
    data: { poids: poidsBase, couverture, declinaisons },
  })
  console.log(`  ✓ ${p.title} — ${poidsBase ?? '?'}g${couverture ? ', ' + couverture : ''}`)
}
process.exit(0)
