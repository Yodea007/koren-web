/**
 * Pré-remplit le global "hero" avec les 2 images bannière actuelles, pour que le diaporama
 * reste affiché tout en devenant éditable depuis l'admin.
 * À lancer une fois : node --env-file=.env --import tsx/esm scripts/seed-hero.ts
 *
 * En prod (Vercel), relancer ensuite la migration des médias pour pousser ces images vers Blob :
 *   BLOB_READ_WRITE_TOKEN="..." npx tsx scripts/migrate-media-to-blob.ts
 */
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

const dir = path.resolve(process.cwd(), 'editeur-livres/media/hero')
const SLIDES = [
  { file: 'Jonas_banner.webp', titre: 'Jonas — Récit graphique' },
  { file: 'pirkei_Avot_Shtainzalz_FRE_3D.webp', titre: 'Pirké Avot — édition Steinsaltz' },
]

const slides: { image: number; titre: string }[] = []
for (const s of SLIDES) {
  const media = await payload.create({
    collection: 'media',
    data: { alt: s.titre },
    filePath: path.join(dir, s.file),
    overrideAccess: true,
  })
  slides.push({ image: media.id as number, titre: s.titre })
  console.log(`✓ ${s.file} → media #${media.id}`)
}

await payload.updateGlobal({
  slug: 'hero',
  data: { intervalle: 5, slides },
  overrideAccess: true,
})
console.log(`\nGlobal "hero" rempli avec ${slides.length} diapositives.`)
process.exit(0)
