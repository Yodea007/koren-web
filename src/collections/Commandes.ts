import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Commandes: CollectionConfig = {
  slug: 'commandes',
  labels: {
    singular: 'Commande libraire',
    plural: 'Commandes libraires',
  },
  access: {
    // Saisie publique depuis l'espace libraires ; lecture/gestion réservées à l'admin.
    create: anyone,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'remisePourcent', 'montantNet', 'statut', 'createdAt'],
    description: 'Bons de commande validés en ligne par les libraires.',
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Généré automatiquement (magasin + date).',
      },
    },
    {
      name: 'statut',
      type: 'select',
      defaultValue: 'nouvelle',
      options: [
        { label: 'Nouvelle', value: 'nouvelle' },
        { label: 'Traitée', value: 'traitee' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'libraire',
      type: 'group',
      label: 'Libraire',
      fields: [
        { name: 'magasin', type: 'text', required: true, label: 'Magasin / enseigne' },
        { name: 'nom', type: 'text', label: 'Nom du contact' },
        { name: 'email', type: 'email', required: true },
        { name: 'telephone', type: 'text', label: 'Téléphone' },
        { name: 'adresse', type: 'textarea' },
      ],
    },
    {
      name: 'remisePourcent',
      type: 'number',
      label: 'Remise (%)',
      min: 0,
      max: 100,
      defaultValue: 0,
    },
    {
      name: 'lignes',
      type: 'array',
      labels: { singular: 'Ligne', plural: 'Lignes' },
      fields: [
        { name: 'titre', type: 'text' },
        { name: 'isbn', type: 'text' },
        { name: 'prixTTC', type: 'number', label: 'Prix TTC' },
        { name: 'qte', type: 'number', label: 'Quantité' },
        { name: 'totalLigne', type: 'number', label: 'Total ligne (brut)' },
      ],
    },
    {
      name: 'totaux',
      type: 'group',
      label: 'Totaux',
      fields: [
        { name: 'nbArticles', type: 'number', label: "Nombre d'articles" },
        { name: 'montantBrut', type: 'number', label: 'Montant brut (€)' },
        { name: 'montantNet', type: 'number', label: 'Montant net après remise (€)' },
      ],
    },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'media',
      label: 'PDF du bon de commande',
      admin: { description: 'Copie générée à la validation.' },
    },
  ],
}
