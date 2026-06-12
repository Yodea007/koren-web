// Importe depuis l'aspiration Shopify :
//  - la page « Notre histoire » → collection Pages (blocs contenu + image)
//  - les 13 articles du blog → collection Posts (images intégrées au contenu)
//  - crée le formulaire « Newsletter » (plugin form-builder)
// Idempotent : ce qui existe déjà (même slug/titre) est sauté.
// Usage : npx payload run scripts/import-pages-blog.ts
import fs from 'fs'
import os from 'os'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { JSDOM } from 'jsdom'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

const payload = await getPayload({ config })

const unescapeHTML = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')

const paragraphe = (texte: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', text: texte, version: 1 }],
      },
    ],
    direction: null,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

// --- Téléversement d'images distantes (dédupliquées par URL)
const imagesParUrl = new Map<string, number | string>()
async function uploadImage(src: string, alt: string) {
  const urlSansParams = src.split('?')[0]
  if (imagesParUrl.has(urlSansParams)) return imagesParUrl.get(urlSansParams)!
  const res = await fetch(src.startsWith('//') ? `https:${src}` : src)
  if (!res.ok) {
    console.warn(`  ⚠ image ignorée (${res.status}) : ${src.slice(0, 80)}`)
    imagesParUrl.set(urlSansParams, null as any)
    return null
  }
  const tmp = path.join(os.tmpdir(), path.basename(urlSansParams))
  fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()))
  const media = await payload.create({ collection: 'media', data: { alt }, filePath: tmp })
  fs.unlinkSync(tmp)
  imagesParUrl.set(urlSansParams, media.id)
  return media.id
}

const blocMedia = (mediaId: number | string) => ({
  type: 'block',
  format: '',
  version: 2,
  fields: {
    id: Math.random().toString(36).slice(2, 12),
    blockName: '',
    blockType: 'mediaBlock',
    media: mediaId,
  },
})

// Convertit du HTML en lexical, en remplaçant les <img> par des blocs média Payload
async function htmlVersLexical(html: string, editorConfig: any, altImages: string) {
  const segments = html.split(/<img[^>]*>/)
  const srcs = [...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1])
  const children: any[] = []
  for (const [i, segment] of segments.entries()) {
    if (segment.trim()) {
      const lexical = convertHTMLToLexical({ editorConfig, html: segment, JSDOM })
      children.push(...lexical.root.children)
    }
    if (srcs[i]) {
      const id = await uploadImage(srcs[i], altImages)
      if (id) children.push(blocMedia(id))
    }
  }
  return {
    root: { type: 'root', children, direction: null, format: '' as const, indent: 0, version: 1 },
  }
}

// ===== 1. Page « Notre histoire »
const pageExistante = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'notre-histoire' } },
  limit: 1,
})
if (pageExistante.docs.length === 0) {
  const { page } = JSON.parse(
    fs.readFileSync('editeur-livres/shopify/page-notre-histoire.json', 'utf8'),
  )
  const pagesConfig = payload.config.collections.find((c) => c.slug === 'pages')!
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  // Découpe le HTML autour des images : blocs contenu / média alternés
  const segments = page.body_html.split(/<img[^>]*>/)
  const srcs = [...page.body_html.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m: any) => m[1])
  const layout: any[] = []
  for (const [i, segment] of segments.entries()) {
    if (segment.trim()) {
      layout.push({
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: convertHTMLToLexical({ editorConfig, html: segment, JSDOM }),
          },
        ],
      })
    }
    if (srcs[i]) {
      layout.push({ blockType: 'mediaBlock', media: await uploadImage(srcs[i], page.title) })
    }
  }

  await payload.create({
    collection: 'pages',
    data: {
      title: page.title,
      slug: 'notre-histoire',
      hero: { type: 'none' },
      layout,
      _status: 'published',
      publishedAt: page.published_at,
    },
    context: { disableRevalidate: true },
  })
  console.log(`✓ Page « ${page.title} » créée (${layout.length} blocs)`)
} else {
  console.log('Page « Notre histoire » déjà présente, sautée')
}

// ===== 2. Articles du blog
const atom = fs.readFileSync('editeur-livres/shopify/blog-news.atom', 'utf8')
const entries = [...atom.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1])
const postsConfig = payload.config.collections.find((c) => c.slug === 'posts')!
const champContent = postsConfig.fields
  .flatMap((f: any) => (f.type === 'tabs' ? f.tabs.flatMap((t: any) => t.fields) : [f]))
  .find((f: any) => f.name === 'content')
const editorPosts = await editorConfigFactory.fromField({ field: champContent as any })

let créés = 0
for (const entry of entries.reverse()) {
  const titre = unescapeHTML(entry.match(/<title>([\s\S]*?)<\/title>/)![1])
  const publié = entry.match(/<published>([\s\S]*?)<\/published>/)![1]
  const html = unescapeHTML(entry.match(/<content type="html">([\s\S]*?)<\/content>/)![1])

  const existant = await payload.find({
    collection: 'posts',
    where: { title: { equals: titre } },
    limit: 1,
  })
  if (existant.docs.length > 0) continue

  await payload.create({
    collection: 'posts',
    data: {
      title: titre,
      content: await htmlVersLexical(html, editorPosts, titre),
      publishedAt: publié,
      _status: 'published',
    },
    context: { disableRevalidate: true },
  })
  créés++
  console.log(`  ✓ ${titre}`)
}
console.log(`Articles créés : ${créés}/${entries.length}`)

// ===== 3. Formulaire newsletter
const formExistant = await payload.find({
  collection: 'forms',
  where: { title: { equals: 'Newsletter' } },
  limit: 1,
})
if (formExistant.docs.length === 0) {
  await payload.create({
    collection: 'forms',
    data: {
      title: 'Newsletter',
      fields: [
        {
          blockType: 'email',
          name: 'email',
          label: 'Votre adresse email',
          required: true,
          width: 100,
        },
      ],
      submitButtonLabel: "S'inscrire",
      confirmationType: 'message',
      confirmationMessage: paragraphe(
        'Merci ! Votre inscription à la newsletter Koren France est bien enregistrée.',
      ),
    },
  })
  console.log('✓ Formulaire « Newsletter » créé')
} else {
  console.log('Formulaire « Newsletter » déjà présent, sauté')
}
process.exit(0)
