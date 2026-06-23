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
    group: 'Catalogue',
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
    },
    slugField({
      position: undefined,
    }),
  ],
}
