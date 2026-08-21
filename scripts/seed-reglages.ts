// Renseigne le global « Réglages » (port 4,90 € · offert dès 75 €). Idempotent.
import { getPayload } from 'payload'
import config from '../src/payload.config'
const payload = await getPayload({ config })
const r = await payload.findGlobal({ slug: 'reglages', depth: 0 })
if (typeof r?.portGratuitDes === 'number' && typeof r?.portForfait === 'number') {
  console.log(`Réglages déjà renseignés : forfait ${r.portForfait} € · offert dès ${r.portGratuitDes} €`)
} else {
  await payload.updateGlobal({
    slug: 'reglages',
    data: { portForfait: 4.9, portGratuitDes: 75 },
  })
  console.log('Réglages posés : forfait 4,90 € · offert dès 75 €')
}
process.exit(0)
