import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

// Réglages de la boutique, modifiables depuis l'admin sans déploiement.
// Consommés par utilities/reglages.ts (header, panier, checkout, webhook).
export const Reglages: GlobalConfig = {
  slug: 'reglages',
  label: 'Réglages',
  access: {
    read: () => true,
  },
  admin: {
    group: '⚙️ Paramètres',
    description: 'Paramètres de la boutique : frais de port et seuil de livraison offerte.',
  },
  hooks: {
    // Le seuil est affiché dans le header (toutes les pages) → on régénère tout le site.
    afterChange: [
      ({ doc, req: { context } }) => {
        if (!context.disableRevalidate) revalidatePath('/', 'layout')
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'portForfait',
      type: 'number',
      label: 'Forfait de port (€)',
      defaultValue: 4.9,
      min: 0,
      admin: { description: 'Appliqué sous le seuil de livraison offerte.' },
    },
    {
      name: 'portGratuitDes',
      type: 'number',
      label: 'Livraison offerte dès (€)',
      defaultValue: 75,
      min: 0,
      admin: {
        description:
          'Seuil (TTC) au-delà duquel le port est offert. Pilote le texte du header ET le calcul réel du panier/paiement.',
      },
    },
  ],
}
