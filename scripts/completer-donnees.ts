// Complète les données du catalogue (todo list août 2026) :
//  1. alt des images de livres (vide → « {titre} — couverture » / « {titre} — vue N »)
//  2. meta.title / meta.description des articles (null → titre + début du contenu)
//  3. Michné Torah → rattacher Adin Steinsaltz
//  4. poids du coffret « Mes premières histoires du Tanakh » (500 g → 2 000 g)
// Idempotent. Usage : APPLY=1 npx payload run scripts/completer-donnees.ts
import { getPayload } from 'payload'
import config from '../src/payload.config'

const APPLY = process.env.APPLY === '1'
const payload = await getPayload({ config })
const tag = APPLY ? '' : ' (simulation)'

// ---- 1. Alt des images produit ----
const { docs: livres } = await payload.find({ collection: 'livres', limit: 200, depth: 1 })
let altsCorriges = 0
const altAttribue = new Set<number>()
for (const livre of livres) {
  const images = (livre.images ?? []).filter((i) => typeof i === 'object') as Array<{
    id: number
    alt?: string | null
  }>
  for (const [i, img] of images.entries()) {
    if (img.alt?.trim() || altAttribue.has(img.id)) continue
    const alt = i === 0 ? `${livre.titre} — couverture` : `${livre.titre} — vue ${i + 1}`
    altsCorriges++
    altAttribue.add(img.id)
    console.log(`alt média #${img.id} : « ${alt} »${tag}`)
    if (APPLY) await payload.update({ collection: 'media', id: img.id, data: { alt } })
  }
}

// ---- 2. Metas des articles ----
const extraireTexte = (o: unknown): string => {
  if (typeof o === 'string') return o + ' '
  if (Array.isArray(o)) return o.map(extraireTexte).join('')
  if (o && typeof o === 'object')
    return Object.entries(o)
      .filter(([k]) => ['text', 'children', 'root'].includes(k))
      .map(([, v]) => extraireTexte(v))
      .join('')
  return ''
}
const { docs: posts } = await payload.find({ collection: 'posts', limit: 100, depth: 0 })
let metasCorrigees = 0
for (const post of posts) {
  const aTitre = Boolean(post.meta?.title?.trim())
  const aDesc = Boolean(post.meta?.description?.trim())
  if (aTitre && aDesc) continue
  const texte = extraireTexte(post.content)
    .replace(/\]\]>/g, ' ') // artefacts CDATA de l'import Shopify
    .replace(/\s+/g, ' ')
    .trim()
  const description =
    texte.length < 30
      ? `${post.title} — l'actualité des éditions Koren France.`
      : texte.length > 155
        ? texte.slice(0, 152).replace(/\s+\S*$/, '') + '…'
        : texte
  metasCorrigees++
  console.log(`meta post #${post.id} (${post.title?.slice(0, 40)}) : desc « ${description.slice(0, 60)}… »${tag}`)
  if (APPLY)
    await payload.update({
      collection: 'posts',
      id: post.id,
      data: {
        meta: {
          ...(post.meta ?? {}),
          title: post.meta?.title || post.title,
          description: post.meta?.description || description,
        },
      },
      context: { disableRevalidate: true },
    })
}

// ---- 3. Michné Torah → Steinsaltz ----
const michne = livres.find((l) => l.slug?.startsWith('michne-torah'))
if (michne) {
  const auteursIds = (michne.auteurs ?? []).map((a) => (typeof a === 'object' ? a.id : a))
  if (!auteursIds.includes(2)) {
    console.log(`livre #${michne.id} (${michne.titre?.slice(0, 40)}) : + auteur Adin Steinsaltz${tag}`)
    if (APPLY)
      await payload.update({
        collection: 'livres',
        id: michne.id,
        data: { auteurs: [...auteursIds, 2] },
        context: { disableRevalidate: true },
      })
  } else console.log('Michné Torah : Steinsaltz déjà rattaché ✓')
}

// ---- 4. Poids du coffret ----
const coffret = livres.find((l) => l.slug === 'mes-premieres-histoires-du-tanakh-coffret-de-4-livres')
if (coffret && coffret.poids !== 2000) {
  console.log(`coffret #${coffret.id} : poids ${coffret.poids ?? 'null'} → 2000 g${tag}`)
  if (APPLY)
    await payload.update({
      collection: 'livres',
      id: coffret.id,
      data: { poids: 2000 },
      context: { disableRevalidate: true },
    })
} else if (coffret) console.log('coffret : poids déjà à 2000 g ✓')

console.log(`\nBilan${tag} : ${altsCorriges} alt, ${metasCorrigees} metas d'articles`)
process.exit(0)
