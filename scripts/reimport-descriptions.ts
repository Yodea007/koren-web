// Réimporte les descriptions contenant des listes HTML, aplaties lors du premier
// import (l'éditeur ne connaissait pas encore les fonctionnalités de liste).
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { JSDOM } from 'jsdom'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

const products = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'editeur-livres/shopify/products.json'), 'utf8'),
)
const payload = await getPayload({ config })

// L'éditeur du champ description, avec listes et titres
const livresConfig = payload.config.collections.find((c) => c.slug === 'livres')!
const champDescription = livresConfig.fields.find((f) => 'name' in f && f.name === 'description') as any
const editorConfig = await editorConfigFactory.fromField({ field: champDescription })

for (const p of products.filter((p: any) => /<[uo]l/i.test(p.body_html))) {
  const { docs } = await payload.find({
    collection: 'livres',
    where: { shopifyHandle: { equals: p.handle } },
    limit: 1,
  })
  if (!docs[0]) continue
  await payload.update({
    collection: 'livres',
    id: docs[0].id,
    data: { description: convertHTMLToLexical({ editorConfig, html: p.body_html, JSDOM }) },
  })
  console.log(`  ✓ ${p.title}`)
}
process.exit(0)
