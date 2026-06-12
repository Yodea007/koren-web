// Import du catalogue aspiré de Shopify (enrichi des ISBN du bon de commande 2026)
// vers les collections Payload : auteurs, categories, media, livres.
// Idempotent : un livre déjà importé (même shopifyHandle) est sauté.
// Usage : npx payload run scripts/import-catalogue.ts
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { JSDOM } from 'jsdom'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

const DATA = path.resolve(process.cwd(), 'editeur-livres')
const products = JSON.parse(fs.readFileSync(path.join(DATA, 'shopify/products-enriched.json'), 'utf8'))
const collections = JSON.parse(fs.readFileSync(path.join(DATA, 'shopify/collections.json'), 'utf8'))
const catalogue = JSON.parse(fs.readFileSync(path.join(DATA, 'catalogue-2026.json'), 'utf8')).entries

const normalise = (s: string) => s.replace(/[’‘]/g, "'").toLowerCase()

// Attribution des auteurs d'après le titre (les données Shopify n'ont pas de champ auteur)
const RAGEN = [
  'une rencontre peu orthodoxe', 'sotah', 'fille de jephté', 'le silence de tamar',
  'les sœurs weiss', 'le dixième chant', 'le serment', 'le fantôme de doña gracia mendes',
]
const AUTEURS: { nom: string; test: (titre: string) => boolean }[] = [
  { nom: 'Jonathan Sacks', test: (t) => /sacks|voix de l'alliance/.test(t) },
  { nom: 'Adin Steinsaltz', test: (t) => /steinsal|maximes des pères/.test(t) },
  { nom: 'Naomi Ragen', test: (t) => RAGEN.some((r) => t.startsWith(r)) },
  { nom: 'Haïm Sabato', test: (t) => t.startsWith("lunes d'automne") },
]

const payload = await getPayload({ config })
const editorConfig = await editorConfigFactory.default({ config: payload.config })

// --- Catégories (une par collection Shopify, sauf « Nouveautés » qui devient un drapeau)
const categorieIds = new Map<string, number | string>()
for (const c of collections) {
  if (c.title === 'Nouveautés') continue
  const existant = await payload.find({
    collection: 'categories',
    where: { title: { equals: c.title } },
    limit: 1,
  })
  const doc =
    existant.docs[0] ??
    (await payload.create({ collection: 'categories', data: { title: c.title } }))
  categorieIds.set(c.title, doc.id)
}
console.log(`Catégories : ${categorieIds.size}`)

// --- Auteurs
const auteurIds = new Map<string, number | string>()
for (const { nom } of AUTEURS) {
  const existant = await payload.find({
    collection: 'auteurs',
    where: { nom: { equals: nom } },
    limit: 1,
  })
  const doc =
    existant.docs[0] ?? (await payload.create({ collection: 'auteurs', data: { nom } }))
  auteurIds.set(nom, doc.id)
}
console.log(`Auteurs : ${auteurIds.size}`)

// --- Appartenance produit → collections Shopify
const collectionsParProduit = new Map<number, string[]>()
for (const c of collections) {
  for (const id of c.product_ids) {
    collectionsParProduit.set(id, [...(collectionsParProduit.get(id) ?? []), c.title])
  }
}

const conditionnementParIsbn = new Map(
  catalogue.filter((e: any) => e.conditionnement).map((e: any) => [e.isbn, e.conditionnement]),
)

// --- Livres
let créés = 0
let sautés = 0
for (const p of products) {
  const existant = await payload.find({
    collection: 'livres',
    where: { shopifyHandle: { equals: p.handle } },
    limit: 1,
  })
  if (existant.docs[0]) {
    sautés++
    continue
  }

  // Images : {handle}.ext puis {handle}-2.ext, {handle}-3.ext…
  const fichiers = fs
    .readdirSync(path.join(DATA, 'shopify/images'))
    .filter((f) => f.match(new RegExp(`^${p.handle}(-\\d+)?\\.\\w+$`)))
    .sort((a, b) => a.length - b.length || a.localeCompare(b))
  const imageIds: (number | string)[] = []
  for (const f of fichiers) {
    const media = await payload.create({
      collection: 'media',
      data: { alt: p.title },
      filePath: path.join(DATA, 'shopify/images', f),
    })
    imageIds.push(media.id)
  }

  const titreNorm = normalise(p.title)
  const auteurs = AUTEURS.filter((a) => a.test(titreNorm)).map((a) => auteurIds.get(a.nom)!)
  const appartenances = collectionsParProduit.get(p.id) ?? []
  const categories = appartenances
    .filter((t) => t !== 'Nouveautés')
    .map((t) => categorieIds.get(t)!)

  // Prix : le bon de commande 2026 fait foi quand il existe, sinon le prix Shopify
  const prixBase = p.prix_catalogue_2026 ?? Number(p.variants[0].price)
  const multiVariantes = p.variants.length > 1
  const isbnProduit = multiVariantes ? undefined : (p.isbn ?? p.variants[0].isbn ?? undefined)
  const conditionnement = conditionnementParIsbn.get(isbnProduit ?? '') as string | undefined

  await payload.create({
    collection: 'livres',
    data: {
      titre: p.title,
      description: convertHTMLToLexical({ editorConfig, html: p.body_html || '<p></p>', JSDOM }),
      prix: prixBase,
      isbn: isbnProduit,
      declinaisons: multiVariantes
        ? p.variants.map((v: any) => ({
            nom: v.title,
            isbn: v.isbn ?? v.barcode ?? undefined,
            prix: Number(v.price) !== prixBase ? Number(v.price) : undefined,
            disponible: v.available,
          }))
        : undefined,
      images: imageIds,
      auteurs,
      categories,
      nouveaute: appartenances.includes('Nouveautés'),
      disponible: p.variants.some((v: any) => v.available),
      dimensions: p.dimensions ?? undefined,
      conditionnement,
      shopifyHandle: p.handle,
    },
  })
  créés++
  console.log(`  ✓ ${p.title}`)
}

console.log(`\nLivres créés : ${créés}, déjà présents : ${sautés}`)
process.exit(0)
