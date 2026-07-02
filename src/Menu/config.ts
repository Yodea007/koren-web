import type { GlobalConfig } from 'payload'

import { revalidateMenu } from './hooks/revalidateMenu'

// Menu du site (sections « Éditions Koren », « Aide »…) éditable dans l'admin.
// Hiérarchie : chaque SECTION contient ses LIENS. Lu par le header (menu ☰) et le footer.
export const Menu: GlobalConfig = {
  slug: 'menu',
  label: 'Menu',
  access: {
    read: () => true,
  },
  admin: {
    description: 'Sections du menu (header + footer). Glisse pour réordonner.',
  },
  fields: [
    {
      name: 'sections',
      type: 'array',
      label: 'Sections',
      labels: { singular: 'Section', plural: 'Sections' },
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Menu/RowLabelSection#RowLabelSection',
        },
      },
      fields: [
        {
          name: 'titre',
          type: 'text',
          required: true,
          admin: { description: 'Ex. « Éditions Koren », « Aide ».' },
        },
        {
          name: 'liens',
          type: 'array',
          label: 'Liens',
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
    },
  ],
  hooks: {
    afterChange: [revalidateMenu],
  },
}
