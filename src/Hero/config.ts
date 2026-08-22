import type { GlobalConfig } from 'payload'

import { revalidateAccueilGlobal } from '../hooks/revalidateAccueil'

export const Hero: GlobalConfig = {
  slug: 'hero',
  label: 'Hero (accueil)',
  access: {
    read: () => true,
  },
  admin: {
    group: '📚 Édition',
    description: 'Le bandeau en haut de la page d’accueil (diaporama).',
  },
  hooks: {
    afterChange: [revalidateAccueilGlobal],
  },
  fields: [
    {
      name: 'intervalle',
      type: 'number',
      label: 'Intervalle (secondes)',
      defaultValue: 5,
      min: 2,
      admin: {
        description: 'Durée d’affichage de chaque diapositive avant transition.',
      },
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Diapositives',
      labels: { singular: 'Diapositive', plural: 'Diapositives' },
      admin: {
        initCollapsed: true,
        description: 'Idéalement des images en bandeau (format large, ~2:1).',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'titre',
          type: 'text',
          admin: { description: 'Texte alternatif / légende (accessibilité).' },
        },
        {
          name: 'lien',
          type: 'relationship',
          relationTo: ['livres', 'posts'],
          label: 'Lien vers',
          admin: {
            description: 'Fiche livre ou article vers lequel pointe la diapositive (clic).',
          },
        },
        {
          name: 'lienUrl',
          type: 'text',
          label: 'Ou URL personnalisée',
          admin: {
            description: 'Utilisée si aucun document n’est choisi ci-dessus. Ex. /catalogue',
          },
        },
        {
          name: 'bouton',
          type: 'text',
          label: 'Texte du bouton',
          admin: {
            description:
              'Si rempli, un bouton s’affiche sur la diapositive (il pointe vers le lien ci-dessus). Ex. « Découvrir »',
          },
        },
        {
          name: 'boutonCouleur',
          type: 'text',
          label: 'Couleur du bouton',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.bouton),
            components: { Field: '@/components/admin/ChampCouleur' },
          },
        },
        {
          type: 'row',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.bouton),
          },
          fields: [
            {
              name: 'boutonX',
              type: 'number',
              label: 'Position X (%)',
              min: 0,
              max: 100,
              defaultValue: 50,
              admin: { description: '0 = bord gauche · 50 = centre · 100 = bord droit', width: '50%' },
            },
            {
              name: 'boutonY',
              type: 'number',
              label: 'Position Y (%)',
              min: 0,
              max: 100,
              defaultValue: 75,
              admin: { description: '0 = haut · 100 = bas', width: '50%' },
            },
          ],
        },
      ],
    },
  ],
}
