import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  OrderedListFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

// Éditeur avec barres d'outils visibles (le defaultLexical n'en affiche aucune)
export const editeurAvecOutils = lexicalEditor({
  features: ({ rootFeatures }) => [
    ...rootFeatures,
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    UnorderedListFeature(),
    OrderedListFeature(),
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
        description: 'Mis en avant sur la page d’accueil.',
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
