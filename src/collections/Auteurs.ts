import type { CollectionConfig } from 'payload'

import { revalidatePath } from 'next/cache'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { slugifier } from '@/utilities/slugifier'
import { editeurAvecOutils } from './Livres'

export const Auteurs: CollectionConfig = {
  slug: 'auteurs',
  labels: {
    singular: 'Auteur',
    plural: 'Auteurs',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: '📚 Édition',
    useAsTitle: 'nom',
  },
  hooks: {
    // Régénère la liste /nos-auteurs et toutes les fiches auteur à chaque édition
    afterChange: [
      ({ doc, req: { context } }) => {
        if (!context.disableRevalidate) revalidatePath('/nos-auteurs', 'layout')
        return doc
      },
    ],
    afterDelete: [
      ({ doc, req: { context } }) => {
        if (!context.disableRevalidate) revalidatePath('/nos-auteurs', 'layout')
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'nom',
      type: 'text',
      required: true,
    },
    {
      name: 'biographie',
      type: 'richText',
      editor: editeurAvecOutils,
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    slugField({
      position: undefined,
      useAsSlug: 'nom',
      // Translittère les accents (é→e, œ→oe) au lieu de les supprimer
      slugify: ({ valueToSlugify }) => slugifier(valueToSlugify ?? ''),
    }),
  ],
}
