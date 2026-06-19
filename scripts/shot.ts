/**
 * Capture d'écran d'une page locale, pour itérer le design en voyant le rendu.
 * Usage : npx tsx scripts/shot.ts [chemin] [sortie.png] [largeur] [fullPage]
 *   npx tsx scripts/shot.ts /                 /tmp/shot.png 1280 1
 *   npx tsx scripts/shot.ts /catalogue        /tmp/cat.png  390  1
 *   npx tsx scripts/shot.ts /livres/le-serment /tmp/fiche.png
 */
import { chromium } from 'playwright'

const pathArg = process.argv[2] || '/'
const out = process.argv[3] || '/tmp/shot.png'
const width = Number(process.argv[4] || 1280)
const fullPage = process.argv[5] !== '0'

const url = pathArg.startsWith('http') ? pathArg : `http://localhost:3000${pathArg}`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width, height: 900 } })
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(400)
await page.screenshot({ path: out, fullPage })
await browser.close()
console.log(`✓ ${url} → ${out} (${width}px${fullPage ? ', fullPage' : ''})`)
