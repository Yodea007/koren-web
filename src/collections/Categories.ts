import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { revalidateAccueil, revalidateAccueilDelete } from '../hooks/revalidateAccueil'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    afterChange: [revalidateAccueil],
    afterDelete: [revalidateAccueilDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Titre développé — utilisé en titre de page (H1) et pour le SEO. Ex. « Bibles — Tanakh & Houmash ».',
      },
    },
    {
      name: 'titreCourt',
      type: 'text',
      admin: {
        description: 'Libellé court pour les menus (header, footer, nav catégories). Optionnel : à défaut, le titre développé est utilisé. Ex. « Bibles & Tanakh ».',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
}
