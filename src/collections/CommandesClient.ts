import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

// Commandes passées par les CLIENTS (paiement en ligne Stripe), distinctes des
// « Commandes libraires ». Créées exclusivement côté serveur par le webhook Stripe
// (Local API → bypass des access) ; jamais via l'API REST publique.
export const CommandesClient: CollectionConfig = {
  slug: 'commandes-client',
  labels: {
    singular: 'Commande en ligne',
    plural: 'Commandes en ligne',
  },
  access: {
    create: () => false, // uniquement le webhook (Local API) ; pas de création publique
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'statut', 'totalTTC', 'createdAt'],
    description: 'Commandes clients payées en ligne (Stripe).',
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      admin: { readOnly: true, description: 'Numéro de commande (généré au paiement).' },
    },
    {
      name: 'statut',
      type: 'select',
      defaultValue: 'payee',
      options: [
        { label: 'Payée', value: 'payee' },
        { label: 'En préparation', value: 'en_preparation' },
        { label: 'Expédiée', value: 'expediee' },
        { label: 'Annulée / remboursée', value: 'annulee' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'client',
      type: 'group',
      label: 'Client',
      fields: [
        { name: 'nom', type: 'text', label: 'Nom' },
        { name: 'email', type: 'email' },
        { name: 'telephone', type: 'text', label: 'Téléphone' },
      ],
    },
    {
      name: 'adresse',
      type: 'group',
      label: 'Adresse de livraison',
      fields: [
        { name: 'ligne1', type: 'text', label: 'Adresse' },
        { name: 'ligne2', type: 'text', label: 'Complément' },
        { name: 'codePostal', type: 'text', label: 'Code postal' },
        { name: 'ville', type: 'text', label: 'Ville' },
        { name: 'pays', type: 'text', label: 'Pays', defaultValue: 'FR' },
      ],
    },
    {
      name: 'lignes',
      type: 'array',
      labels: { singular: 'Ligne', plural: 'Lignes' },
      fields: [
        { name: 'ref', type: 'text', admin: { readOnly: true } },
        { name: 'titre', type: 'text' },
        { name: 'isbn', type: 'text' },
        { name: 'prixTTC', type: 'number', label: 'Prix TTC' },
        { name: 'qte', type: 'number', label: 'Quantité' },
        { name: 'totalLigne', type: 'number', label: 'Total ligne' },
      ],
    },
    // Totaux (TTC ; TVA livres 5,5 % incluse dans les prix).
    { name: 'sousTotalTTC', type: 'number', label: 'Sous-total articles (TTC)' },
    { name: 'port', type: 'number', label: 'Frais de port (TTC)' },
    { name: 'totalTTC', type: 'number', label: 'Total payé (TTC)' },
    { name: 'tvaIncluse', type: 'number', label: 'Dont TVA (5,5 %)' },
    {
      name: 'stripeSessionId',
      type: 'text',
      label: 'Stripe — Session',
      admin: { readOnly: true, position: 'sidebar' },
      index: true,
    },
    {
      name: 'stripePaymentIntent',
      type: 'text',
      label: 'Stripe — Paiement',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'media',
      label: 'Récapitulatif PDF',
      admin: { description: 'Reçu généré à la commande.' },
    },
  ],
}
