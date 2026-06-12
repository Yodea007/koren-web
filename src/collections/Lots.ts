import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { editeurAvecOutils } from './Livres'

export const Lots: CollectionConfig = {
  slug: 'lots',
  labels: {
    singular: 'Lot',
    plural: 'Lots',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'modePrix', 'disponible', 'updatedAt'],
    description:
      'Offres groupées de plusieurs livres. Chaque livre concerné affichera le lot sur sa fiche.',
  },
  fields: [
    {
      name: 'titre',
      type: 'text',
      required: true,
    },
    {
      name: 'livres',
      type: 'relationship',
      relationTo: 'livres',
      hasMany: true,
      required: true,
      minRows: 2,
    },
    {
      name: 'modePrix',
      type: 'select',
      label: 'Mode de prix',
      required: true,
      defaultValue: 'remise',
      options: [
        { label: 'Remise en % sur le total des livres', value: 'remise' },
        { label: 'Prix fixe', value: 'fixe' },
      ],
    },
    {
      name: 'remisePourcent',
      type: 'number',
      label: 'Remise (%)',
      min: 0,
      max: 100,
      admin: {
        condition: (_data, siblingData) => siblingData?.modePrix === 'remise',
      },
    },
    {
      name: 'prix',
      type: 'number',
      label: 'Prix fixe (€)',
      min: 0,
      admin: {
        condition: (_data, siblingData) => siblingData?.modePrix === 'fixe',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: editeurAvecOutils,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Facultatif — sinon le site montrera les couvertures des livres du lot.',
      },
    },
    {
      name: 'disponible',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    slugField({
      position: undefined,
      useAsSlug: 'titre',
    }),
  ],
}
