// Règles commerciales de la boutique en ligne — un seul endroit à éditer.
//
// ⚠️ À CONFIRMER avec le client : montant du forfait de port et seuil de gratuité.
// Valeurs par défaut posées (standard pour l'envoi de livres en France).

/** Taux de TVA des livres en France (réduit). Les prix affichés sont TTC. */
export const TVA_LIVRE = 0.055

/** Forfait de frais de port (en euros), appliqué sous le seuil de gratuité. */
export const PORT_FORFAIT = 4.9

/** Au-dessus de ce montant d'articles (TTC), le port est offert. */
export const PORT_GRATUIT_DES = 60

/** Frais de port pour un sous-total d'articles donné (TTC, en euros). */
export function fraisDePort(sousTotalTTC: number): number {
  if (sousTotalTTC >= PORT_GRATUIT_DES) return 0
  return PORT_FORFAIT
}

/** Part de TVA contenue dans un montant TTC (livres, 5,5 %). */
export function tvaIncluse(montantTTC: number): number {
  return montantTTC - montantTTC / (1 + TVA_LIVRE)
}

/** Montant hors taxes correspondant à un montant TTC. */
export function montantHT(montantTTC: number): number {
  return montantTTC / (1 + TVA_LIVRE)
}

/** Arrondi à 2 décimales (centimes), en nombre. */
export const centimes = (n: number): number => Math.round(n * 100) / 100

/** Montant TTC → centimes entiers (unité attendue par Stripe). */
export const enCentimesStripe = (montantTTC: number): number => Math.round(montantTTC * 100)
