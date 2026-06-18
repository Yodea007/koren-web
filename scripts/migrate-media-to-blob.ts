/**
 * Téléverse les médias locaux (editeur-livres/media) vers Vercel Blob, en conservant
 * les noms de fichiers (originaux + toutes les tailles générées par Payload), afin que
 * les URLs /api/media/file/<nom> continuent de résoudre une fois le site déployé.
 *
 * À lancer UNE FOIS, en local, avec le token Blob du projet Vercel :
 *   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxx" npx tsx scripts/migrate-media-to-blob.ts
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'
import { put } from '@vercel/blob'

const token = process.env.BLOB_READ_WRITE_TOKEN
if (!token) {
  console.error('❌ BLOB_READ_WRITE_TOKEN manquant. Lance avec : BLOB_READ_WRITE_TOKEN="..." npx tsx scripts/migrate-media-to-blob.ts')
  process.exit(1)
}

const MEDIA_DIR = path.resolve(process.cwd(), 'editeur-livres/media')

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })

const files = walk(MEDIA_DIR)
console.log(`${files.length} fichiers à téléverser depuis ${MEDIA_DIR}\n`)

let n = 0
for (const file of files) {
  const name = path.basename(file)
  await put(name, readFileSync(file), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  })
  n++
  if (n % 10 === 0 || n === files.length) console.log(`✓ ${n}/${files.length}`)
}
console.log(`\nTerminé : ${n} fichiers téléversés sur Vercel Blob.`)
process.exit(0)
