// Réattache les couvertures aux livres : retrouve les médias par nom de fichier
// ({handle}.ext, {handle}-2.ext…) et les recrée depuis editeur-livres/shopify/images
// s'ils n'existent plus en base. Idempotent.
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

const DATA = path.resolve(process.cwd(), 'editeur-livres')
const products = JSON.parse(fs.readFileSync(path.join(DATA, 'shopify/products-enriched.json'), 'utf8'))
const payload = await getPayload({ config })
const medias = (await payload.find({ collection: 'media', limit: 1000, depth: 0 })).docs

let réparés = 0
let uploadés = 0
for (const p of products) {
  const { docs } = await payload.find({
    collection: 'livres',
    where: { shopifyHandle: { equals: p.handle } },
    limit: 1,
    depth: 0,
  })
  const livre = docs[0]
  if (!livre || (livre.images?.length ?? 0) > 0) continue

  const re = new RegExp(`^${p.handle}(-\\d+)?\\.\\w+$`)
  const fichiers = fs
    .readdirSync(path.join(DATA, 'shopify/images'))
    .filter((f) => re.test(f))
    .sort((a, b) => a.length - b.length || a.localeCompare(b))

  const images: (number | string)[] = []
  for (const f of fichiers) {
    const existant = medias.find((m: any) => m.filename === f)
    if (existant) {
      images.push(existant.id)
    } else {
      const media = await payload.create({
        collection: 'media',
        data: { alt: p.title },
        filePath: path.join(DATA, 'shopify/images', f),
      })
      images.push(media.id)
      uploadés++
    }
  }
  if (!images.length) {
    console.log(`  ⚠ aucune image pour ${p.handle}`)
    continue
  }
  await payload.update({ collection: 'livres', id: livre.id, data: { images } })
  réparés++
}
console.log(`Livres réparés : ${réparés} | images réuploadées : ${uploadés}`)
process.exit(0)
