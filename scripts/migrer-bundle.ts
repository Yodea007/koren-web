// Déplace le bundle « Voix de l'Alliance tomes 1 et 2 » de Livres vers Lots.
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

const bundle = (await payload.find({
  collection: 'livres',
  where: { titre: { contains: 'tomes 1 et 2' } },
  limit: 1,
  depth: 0,
})).docs[0]
if (!bundle) {
  console.log('Bundle déjà migré, rien à faire.')
  process.exit(0)
}

const tomes = (await payload.find({
  collection: 'livres',
  where: { titre: { like: "Voix de l'Alliance" } },
  depth: 0,
})).docs.filter((d) => d.id !== bundle.id)
if (tomes.length !== 2) throw new Error(`2 tomes attendus, ${tomes.length} trouvés`)

// 58 € au total, vendu 55,10 € sur Shopify = remise de 5 %
const lot = await payload.create({
  collection: 'lots',
  data: {
    titre: "Les Voix de l'Alliance — tomes 1 et 2",
    livres: tomes.map((t) => t.id),
    modePrix: 'remise',
    remisePourcent: 5,
    description: bundle.description,
    image: bundle.images?.[0] ?? undefined,
  },
})
await payload.delete({ collection: 'livres', id: bundle.id })
console.log(`✓ Lot créé (« ${lot.titre} », −5 %), fiche livre supprimée`)
console.log(`  contient : ${tomes.map((t) => t.titre).join(' + ')}`)
process.exit(0)
