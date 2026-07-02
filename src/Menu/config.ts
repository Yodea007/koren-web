import type { GlobalConfig } from 'payload'

import { revalidateMenu } from './hooks/revalidateMenu'

// Menu du site (header ☰ + footer) éditable dans l'admin.
// Structure PLATE : une simple liste de liens, chacun avec un « Groupe » (parent)
// qui les range ensemble à l'affichage (ex. « Éditions Koren », « Aide »).
export const Menu: GlobalConfig = {
  slug: 'menu',
  label: 'Menu',
  access: {
    read: () => true,
  },
  admin: {
    description:
      'Liste des liens du menu (header + footer). Chaque lien a un « Groupe » (parent) qui le range. Glisse pour réordonner.',
  },
  fields: [
    {
      name: 'liens',
      type: 'array',
      label: 'Liens du menu',
      labels: { singular: 'Lien', plural: 'Liens' },
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Menu/RowLabelLien#RowLabelLien',
        },
      },
      fields: [
        { name: 'intitule', type: 'text', required: true, label: 'Intitulé' },
        {
          name: 'groupe',
          type: 'text',
          required: true,
          label: 'Groupe (parent)',
          admin: {
            description:
              'Ex. « Éditions Koren », « Aide ». Les liens du même groupe sont affichés ensemble, dans l’ordre.',
          },
        },
        {
          name: 'typeLien',
          type: 'radio',
          defaultValue: 'page',
          options: [
            { label: 'Page du site', value: 'page' },
            { label: 'Lien direct (URL)', value: 'url' },
          ],
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          admin: { condition: (_data, siblingData) => siblingData?.typeLien === 'page' },
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          admin: {
            description: 'Ex. /libraires, /posts, ou une URL externe.',
            condition: (_data, siblingData) => siblingData?.typeLien === 'url',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateMenu],
  },
}
