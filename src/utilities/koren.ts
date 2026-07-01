import type { Livre } from '@/payload-types'

// Libellés courts pour les pastilles de langue (ex. « HE/FR »)
export const LANGUE_LABELS: Record<string, string> = {
  he: 'HE',
  fr: 'FR',
  en: 'EN',
  de: 'DE',
  arc: 'ARA',
}

export const RITE_LABELS: Record<string, string> = {
  sefarade: 'Séfarade',
  ashkenaze: 'Ashkénaze',
  commun: 'Tous rites',
}

// Couleurs de reliure — hex pour les pastilles (fonds de couverture Koren)
export const RELIURE_HEX: Record<string, string> = {
  bordeaux: '#6e1726',
  marine: '#1e2a44',
  vert: '#243a2e',
}

export const RELIURE_LABELS: Record<string, string> = {
  bordeaux: 'Bordeaux',
  marine: 'Marine',
  vert: 'Vert',
}

/** Prix en euros : entier « 29 € », sinon « 29,50 € ». */
export function formatPrix(prix?: number | null): string {
  if (prix == null) return ''
  const s = Number.isInteger(prix) ? String(prix) : prix.toFixed(2).replace('.', ',')
  return `${s} €`
}

/** Pastilles de langue d'un livre (ex. ['HE','FR']). */
export function languePills(livre: Pick<Livre, 'langues'>): string[] {
  return (livre.langues ?? []).map((l) => LANGUE_LABELS[l] ?? l.toUpperCase())
}

/** Première image (couverture) d'un livre, ou null. */
export function couverture(livre: Pick<Livre, 'images'>) {
  const img = livre.images?.[0]
  return typeof img === 'object' ? img : null
}

// Les six catégories : ordre d'affichage (design) par slug de catégorie.
// (Les libellés — court « titreCourt » pour les menus, développé « title » pour les pages —
//  sont désormais édités dans l'admin, collection Categories.)
export const CATEGORIE_ORDRE = [
  'bibles--tanakh--houmash',
  'livres-de-prires--siddour--mahzor',
  'talmud--commentaires',
  'essais-et-commentaires',
  'littrature',
  'jeunesse',
]

export const ordreCategorie = (slug: string): number => {
  const i = CATEGORIE_ORDRE.indexOf(slug)
  return i === -1 ? 99 : i
}

/** Libellé court d'une catégorie pour les menus : `titreCourt` si renseigné, sinon le titre développé. */
export const labelCategorieCourt = (
  cat: { titreCourt?: string | null; title?: string | null },
  fallback = 'Autres',
): string => cat.titreCourt || cat.title || fallback

/** Eyebrow de carte : accroche si présente, sinon le rite. */
export function eyebrow(livre: Pick<Livre, 'accroche' | 'rite'>): string | null {
  if (livre.accroche) return livre.accroche
  if (livre.rite) return RITE_LABELS[livre.rite] ?? null
  return null
}
