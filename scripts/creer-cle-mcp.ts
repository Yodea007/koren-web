// Crée la clé API MCP « Claude » (idempotent : ne recrée pas si elle existe).
// Usage : npx payload run scripts/creer-cle-mcp.ts
import crypto from 'crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })

const deja = await payload.find({
  collection: 'payload-mcp-api-keys',
  where: { label: { equals: 'Claude (conversation)' } },
  limit: 1,
})
if (deja.totalDocs > 0) {
  console.log('La clé « Claude (conversation) » existe déjà — rien à faire.')
  process.exit(0)
}

const { docs: users } = await payload.find({ collection: 'users', limit: 1, sort: 'createdAt' })
if (!users[0]) throw new Error('Aucun utilisateur admin trouvé.')

const apiKey = crypto.randomUUID()
await payload.create({
  collection: 'payload-mcp-api-keys',
  data: {
    user: users[0].id,
    label: 'Claude (conversation)',
    description: 'Clé pour piloter le site en conversation (Claude). Pas de suppression, commandes en lecture seule.',
    enableAPIKey: true,
    apiKey,
    livres: { find: true, create: true, update: true },
    auteurs: { find: true, create: true, update: true },
    posts: { find: true, create: true, update: true },
    categories: { find: true },
    pages: { find: true, create: true, update: true },
    media: { find: true },
    lots: { find: true },
    commandesClient: { find: true }, // ⚠️ le plugin camelise les slugs (commandes-client → commandesClient)
    commandes: { find: true },
  } as never,
})
console.log('CLE_CREEE ' + apiKey)
process.exit(0)
