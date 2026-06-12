// Aspire le catalogue public de la boutique Shopify (produits, collections, images)
// vers le dossier de données editeur-livres/shopify/ (gitignoré).
// Usage : node scripts/aspire-shopify.mjs
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'https://www.korenfrance.com'
const OUT = path.resolve(import.meta.dirname, '../editeur-livres/shopify')
const IMAGES = path.join(OUT, 'images')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchJSON(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url)
    if (res.ok) return res.json()
    if (res.status === 429) {
      await sleep(2000 * attempt)
      continue
    }
    throw new Error(`${res.status} sur ${url}`)
  }
  throw new Error(`429 persistant sur ${url}`)
}

async function fetchAllPages(pathname, key) {
  const all = []
  for (let page = 1; ; page++) {
    const data = await fetchJSON(`${BASE}${pathname}?limit=250&page=${page}`)
    const items = data[key] ?? []
    all.push(...items)
    if (items.length < 250) break
    await sleep(300)
  }
  return all
}

fs.mkdirSync(IMAGES, { recursive: true })

// 1. Tous les produits
const products = await fetchAllPages('/products.json', 'products')
console.log(`Produits : ${products.length}`)

// 1bis. Les codes-barres (ISBN) ne sont exposés que par /products/{handle}.js
for (const p of products) {
  await sleep(200)
  const detail = await fetchJSON(`${BASE}/products/${p.handle}.js`)
  const barcodes = new Map(detail.variants.map((v) => [v.id, v.barcode || null]))
  for (const v of p.variants) v.barcode = barcodes.get(v.id) ?? null
}
const avecIsbn = products.filter((p) => p.variants.some((v) => v.barcode)).length
fs.writeFileSync(path.join(OUT, 'products.json'), JSON.stringify(products, null, 2))
console.log(`  dont avec code-barres/ISBN : ${avecIsbn}`)

// 2. Collections + appartenance des produits (la structure de navigation)
const collections = await fetchAllPages('/collections.json', 'collections')
for (const c of collections) {
  await sleep(300)
  const items = await fetchAllPages(`/collections/${c.handle}/products.json`, 'products')
  c.product_ids = items.map((p) => p.id)
}
fs.writeFileSync(path.join(OUT, 'collections.json'), JSON.stringify(collections, null, 2))
console.log(`Collections : ${collections.length}`)

// 3. Images (nom de fichier = handle du produit, pour retrouver facilement)
let downloaded = 0
let skipped = 0
for (const p of products) {
  for (const [i, img] of p.images.entries()) {
    const ext = (new URL(img.src).pathname.match(/\.(\w+)$/)?.[1] ?? 'jpg').toLowerCase()
    const file = path.join(IMAGES, `${p.handle}${i > 0 ? `-${i + 1}` : ''}.${ext}`)
    if (fs.existsSync(file)) {
      skipped++
      continue
    }
    const res = await fetch(img.src)
    if (!res.ok) {
      console.warn(`  image manquée (${res.status}) : ${img.src}`)
      continue
    }
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()))
    downloaded++
    await sleep(150)
  }
}
console.log(`Images : ${downloaded} téléchargées, ${skipped} déjà présentes`)
console.log(`Tout est dans ${OUT}`)
