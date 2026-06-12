// Remplace les 12 catégories héritées de Shopify par les 6 rayons du catalogue
// papier 2026, et complète chaque livre avec les détails du PDF (pages,
// couverture, langues, poids précis), appariés par ISBN puis par titre.
import fs from 'fs'
import { getPayload } from 'payload'
import config from '@payload-config'

const details = JSON.parse(fs.readFileSync('editeur-livres/catalogue-2026-details.json', 'utf8'))
const payload = await getPayload({ config })

// 1. Les 6 rayons
const rayonIds = new Map<string, number | string>()
for (const titre of details.rayons) {
  const existant = await payload.find({
    collection: 'categories',
    where: { title: { equals: titre } },
    limit: 1,
  })
  const doc =
    existant.docs[0] ?? (await payload.create({ collection: 'categories', data: { title: titre } }))
  rayonIds.set(titre, doc.id)
}

// 2. Mise à jour des livres
const anciennes = new Set<number | string>()
const sansRayon: string[] = []
const { docs: livres } = await payload.find({ collection: 'livres', limit: 100, depth: 0 })

for (const livre of livres) {
  for (const c of livre.categories ?? []) anciennes.add(c as number | string)

  const isbns = [livre.isbn, ...(livre.declinaisons ?? []).map((d: any) => d.isbn)].filter(Boolean)
  let info = isbns.map((i) => details.parIsbn[i as string]).find(Boolean)
  let isbnManquant: string | undefined
  if (!info) {
    const clef = Object.keys(details.parTitre).find((t) => livre.titre.startsWith(t))
    if (clef) {
      info = details.parTitre[clef]
      isbnManquant = details.parTitre[clef].isbn
    }
  }
  if (!info) {
    sansRayon.push(livre.titre)
    continue
  }

  const declinaisons = (livre.declinaisons ?? []).map((d: any) => {
    const dInfo = d.isbn && details.parIsbn[d.isbn]
    return dInfo?.poidsKg ? { ...d, poids: Math.round(dInfo.poidsKg * 1000) } : d
  })
  // Pages au niveau livre seulement si toutes les déclinaisons concordent
  const pagesDecl = (livre.declinaisons ?? [])
    .map((d: any) => d.isbn && details.parIsbn[d.isbn]?.pages)
    .filter(Boolean)
  const pages =
    info.pages ?? (pagesDecl.length && new Set(pagesDecl).size === 1 ? pagesDecl[0] : undefined)

  await payload.update({
    collection: 'livres',
    id: livre.id,
    data: {
      categories: [rayonIds.get(info.rayon)!],
      pages,
      couverture: info.couverture ?? livre.couverture ?? undefined,
      poids: info.poidsKg ? Math.round(info.poidsKg * 1000) : livre.poids,
      langues: info.langues ?? undefined,
      isbn: livre.isbn ?? isbnManquant,
      declinaisons: declinaisons.length ? declinaisons : undefined,
    },
  })
  console.log(`  ✓ ${livre.titre} → ${info.rayon}`)
}

// 3. Suppression des anciennes catégories Shopify
let supprimées = 0
for (const id of anciennes) {
  if ([...rayonIds.values()].includes(id)) continue
  await payload.delete({ collection: 'categories', id })
  supprimées++
}
console.log(`\nRayons : ${rayonIds.size} | livres sans rayon : ${sansRayon.length} | anciennes catégories supprimées : ${supprimées}`)
sansRayon.forEach((t) => console.log('  ⚠ sans rayon :', t))
process.exit(0)
