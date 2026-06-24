import type { Category, Livre } from '@/payload-types'

import { labelCategorie, ordreCategorie } from './koren'

/** Une ligne vendable du tarif : un livre, ou une déclinaison (édition) d'un livre. */
export type Article = {
  /** Référence stable (clé de ligne / champ caché du formulaire). */
  ref: string
  titre: string
  isbn: string
  /** Prix public TTC (TVA livres incluse). */
  prixTTC: number
  poids: number | null
  dimensions: string | null
  parCarton: number | null
  categorieSlug: string
  categorieLabel: string
  disponible: boolean
}

export type CategorieArticles = {
  slug: string
  label: string
  articles: Article[]
}

const premiereCategorie = (livre: Livre): Category | null => {
  const cat = (livre.categories ?? []).find((c) => typeof c === 'object') as Category | undefined
  return cat ?? null
}

/**
 * Aplatit un livre en lignes vendables :
 * - une ligne par déclinaison si le livre en a (ISBN/prix/poids/par carton résolus par fallback) ;
 * - sinon une seule ligne pour le livre.
 */
export function articlesDeLivre(livre: Livre): Article[] {
  const cat = premiereCategorie(livre)
  const categorieSlug = cat?.slug ?? ''
  const categorieLabel = labelCategorie(categorieSlug, cat?.title ?? 'Autres')
  const base = {
    categorieSlug,
    categorieLabel,
    dimensions: livre.dimensions ?? null,
  }

  const declinaisons = livre.declinaisons ?? []
  if (declinaisons.length > 0) {
    return declinaisons.map((d, i) => ({
      ...base,
      ref: `livre-${livre.id}-${i}`,
      titre: d.nom ? `${livre.titre} — ${d.nom}` : livre.titre,
      isbn: d.isbn ?? livre.isbn ?? '',
      prixTTC: d.prix ?? livre.prix,
      poids: d.poids ?? livre.poids ?? null,
      parCarton: d.parCarton ?? livre.parCarton ?? null,
      disponible: d.disponible !== false && livre.disponible !== false,
    }))
  }

  return [
    {
      ...base,
      ref: `livre-${livre.id}`,
      titre: livre.titre,
      isbn: livre.isbn ?? '',
      prixTTC: livre.prix,
      poids: livre.poids ?? null,
      parCarton: livre.parCarton ?? null,
      disponible: livre.disponible !== false,
    },
  ]
}

/** Tous les articles d'une liste de livres, groupés et ordonnés par catégorie (ordre du catalogue). */
export function articlesParCategorie(livres: Livre[]): CategorieArticles[] {
  const map = new Map<string, CategorieArticles>()
  for (const livre of livres) {
    for (const a of articlesDeLivre(livre)) {
      let groupe = map.get(a.categorieSlug)
      if (!groupe) {
        groupe = { slug: a.categorieSlug, label: a.categorieLabel, articles: [] }
        map.set(a.categorieSlug, groupe)
      }
      groupe.articles.push(a)
    }
  }
  return [...map.values()].sort((x, y) => ordreCategorie(x.slug) - ordreCategorie(y.slug))
}
