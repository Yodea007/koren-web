// Règles commerciales de la boutique en ligne.
//
// Forfait de port et seuil de gratuité sont pilotés depuis l'admin (global
// « Réglages », lu par utilities/reglages.ts). Les constantes ci-dessous ne
// servent que de REPLI si le global n'est pas renseigné.

/** Taux de TVA des livres en France (réduit). Les prix affichés sont TTC. */
export const TVA_LIVRE = 0.055

/** Repli : forfait de frais de port (en euros), appliqué sous le seuil de gratuité. */
export const PORT_FORFAIT = 4.9

/** Repli : au-dessus de ce montant d'articles (TTC), le port est offert. */
export const PORT_GRATUIT_DES = 75

/** Frais de port pour un sous-total donné (TTC, en euros). Les valeurs du global
 *  « Réglages » sont passées via `opts` ; sans elles, replis ci-dessus. */
export function fraisDePort(
  sousTotalTTC: number,
  opts?: { forfait?: number; gratuitDes?: number },
): number {
  if (sousTotalTTC >= (opts?.gratuitDes ?? PORT_GRATUIT_DES)) return 0
  return opts?.forfait ?? PORT_FORFAIT
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
