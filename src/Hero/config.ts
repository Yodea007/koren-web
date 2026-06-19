import type { GlobalConfig } from 'payload'

export const Hero: GlobalConfig = {
  slug: 'hero',
  label: 'Hero (accueil)',
  access: {
    read: () => true,
  },
  admin: {
    description: 'Le bandeau en haut de la page d’accueil (diaporama).',
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
      ],
    },
  ],
}
