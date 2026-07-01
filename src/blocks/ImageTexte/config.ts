import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

// Bloc « Image + Texte » : une image et un texte côte à côte (responsive :
// l'image passe au-dessus du texte sur mobile).
export const ImageTexte: Block = {
  slug: 'imageTexte',
  interfaceName: 'ImageTexteBlock',
  labels: { singular: 'Image + Texte', plural: 'Image + Texte' },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'position',
          type: 'select',
          defaultValue: 'left',
          options: [
            { label: 'Image à gauche', value: 'left' },
            { label: 'Image à droite', value: 'right' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'largeur',
          type: 'select',
          defaultValue: 'half',
          label: "Largeur de l'image",
          options: [
            { label: 'Un tiers', value: 'third' },
            { label: 'Moitié', value: 'half' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'richText',
      type: 'richText',
      label: 'Texte',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
}
