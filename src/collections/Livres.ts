import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  OrderedListFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

// Options partagées entre le livre et ses déclinaisons
export const optionsLangues = [
  { label: 'Hébreu', value: 'he' },
  { label: 'Français', value: 'fr' },
  { label: 'Anglais', value: 'en' },
  { label: 'Allemand', value: 'de' },
  { label: 'Araméen', value: 'arc' },
]

export const optionsRite = [
  { label: 'Séfarade', value: 'sefarade' },
  { label: 'Ashkénaze', value: 'ashkenaze' },
  { label: 'Commun / tous rites', value: 'commun' },
]

export const optionsReliure = [
  { label: 'Bordeaux', value: 'bordeaux' },
  { label: 'Marine', value: 'marine' },
  { label: 'Vert', value: 'vert' },
]

// Éditeur avec barres d'outils visibles (le defaultLexical n'en affiche aucune)
export const editeurAvecOutils = lexicalEditor({
  features: ({ rootFeatures }) => [
    ...rootFeatures,
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    UnorderedListFeature(),
    OrderedListFeature(),
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: 'caption',
              type: 'richText',
              editor: lexicalEditor(),
            },
          ],
        },
      },
    }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})

export const Livres: CollectionConfig = {
  slug: 'livres',
  labels: {
    singular: 'Livre',
    plural: 'Livres',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'prix', 'disponible', 'nouveaute', 'updatedAt'],
  },
  fields: [
    {
      name: 'titre',
      type: 'text',
      required: true,
    },
    {
      name: 'accroche',
      type: 'text',
      label: 'Accroche',
      admin: {
        description: 'Sous-titre court affiché sous le titre (hero, fiche). Ex. « une lecture de la Torah ».',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: editeurAvecOutils,
    },
    {
      name: 'prix',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Prix public en euros. Une déclinaison peut le remplacer par le sien.',
      },
    },
    {
      name: 'isbn',
      type: 'text',
      admin: {
        description: 'Pour un livre sans déclinaisons. Sinon, renseigner l’ISBN de chaque déclinaison.',
      },
    },
    {
      name: 'declinaisons',
      type: 'array',
      labels: {
        singular: 'Déclinaison',
        plural: 'Déclinaisons',
      },
      admin: {
        description: 'Éditions du même livre : couleur, langue, tradition… Chacune a son ISBN.',
      },
      fields: [
        {
          name: 'nom',
          type: 'text',
          required: true,
        },
        {
          name: 'tome',
          type: 'number',
          min: 1,
          admin: {
            description: 'Numéro de tome/volume. Rempli → un sélecteur « Volume » apparaît sur la fiche.',
          },
        },
        {
          name: 'rite',
          type: 'select',
          options: optionsRite,
          admin: {
            description: 'À renseigner si le rite varie d’une édition à l’autre.',
          },
        },
        {
          name: 'langues',
          type: 'select',
          hasMany: true,
          options: optionsLangues,
          admin: {
            description: 'Laisser vide pour utiliser les langues du livre.',
          },
        },
        {
          name: 'couleurReliure',
          type: 'select',
          options: optionsReliure,
          label: 'Couleur de reliure',
          admin: {
            description: 'Rempli → un sélecteur de couleur (pastilles) apparaît sur la fiche.',
          },
        },
        {
          name: 'isbn',
          type: 'text',
        },
        {
          name: 'prix',
          type: 'number',
          min: 0,
          admin: {
            description: 'Laisser vide pour utiliser le prix du livre.',
          },
        },
        {
          name: 'poids',
          type: 'number',
          min: 0,
          admin: {
            description: 'En grammes. Laisser vide pour utiliser le poids du livre.',
          },
        },
        {
          name: 'parCarton',
          type: 'number',
          label: 'Nombre par carton',
          min: 0,
          admin: {
            description: 'Laisser vide pour utiliser la valeur du livre.',
          },
        },
        {
          name: 'disponible',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'La première image est la couverture.',
      },
    },
    {
      name: 'auteurs',
      type: 'relationship',
      relationTo: 'auteurs',
      hasMany: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'nouveaute',
      type: 'checkbox',
      label: 'Nouveauté',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Mis en avant en hero sur la page d’accueil.',
      },
    },
    {
      name: 'selection',
      type: 'checkbox',
      label: 'Sélection de la maison',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Affiché dans « La sélection de la maison » sur l’accueil.',
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
    {
      name: 'dimensions',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'poids',
      type: 'number',
      min: 0,
      admin: {
        position: 'sidebar',
        description: 'En grammes — servira au calcul des frais de port.',
      },
    },
    {
      name: 'parCarton',
      type: 'number',
      label: 'Nombre par carton',
      min: 0,
      admin: {
        position: 'sidebar',
        description: 'Quantité de cet ouvrage par carton (tarif libraires).',
      },
    },
    {
      name: 'couverture',
      type: 'select',
      options: [
        { label: 'Rigide', value: 'rigide' },
        { label: 'Souple', value: 'souple' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'pages',
      type: 'number',
      label: 'Nombre de pages',
      min: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'langues',
      type: 'select',
      hasMany: true,
      options: optionsLangues,
      admin: {
        position: 'sidebar',
        description: 'Langues du livre (défaut). Une déclinaison peut les remplacer.',
      },
    },
    {
      name: 'rite',
      type: 'select',
      options: optionsRite,
      admin: {
        position: 'sidebar',
        description: 'Rite du livre (défaut). Une déclinaison peut le remplacer.',
      },
    },
    {
      name: 'conditionnement',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Ex. « 17 vol. », « coffret 4 livres »',
      },
    },
    {
      name: 'extraitPdf',
      type: 'upload',
      relationTo: 'media',
      label: 'Extrait PDF',
    },
    {
      name: 'communiquePresse',
      type: 'upload',
      relationTo: 'media',
      label: 'Communiqué de presse (PDF)',
    },
    {
      name: 'youtube',
      type: 'text',
      label: 'Lien YouTube (événement)',
    },
    {
      name: 'lots',
      type: 'join',
      collection: 'lots',
      on: 'livres',
      label: 'Présent dans les lots',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'shopifyHandle',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Identifiant d’origine sur Shopify (importé).',
      },
    },
    slugField({
      position: undefined,
      useAsSlug: 'titre',
    }),
  ],
}
