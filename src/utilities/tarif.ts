import type { Category, Livre } from '@/payload-types'

import { labelRayon, ordreRayon } from './koren'

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
  rayonSlug: string
  rayonLabel: string
  disponible: boolean
}

export type RayonArticles = {
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
  const rayonSlug = cat?.slug ?? ''
  const rayonLabel = labelRayon(rayonSlug, cat?.title ?? 'Autres')
  const base = {
    rayonSlug,
    rayonLabel,
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

/** Tous les articles d'une liste de livres, groupés et ordonnés par rayon (ordre du catalogue). */
export function articlesParRayon(livres: Livre[]): RayonArticles[] {
  const map = new Map<string, RayonArticles>()
  for (const livre of livres) {
    for (const a of articlesDeLivre(livre)) {
      let groupe = map.get(a.rayonSlug)
      if (!groupe) {
        groupe = { slug: a.rayonSlug, label: a.rayonLabel, articles: [] }
        map.set(a.rayonSlug, groupe)
      }
      groupe.articles.push(a)
    }
  }
  return [...map.values()].sort((x, y) => ordreRayon(x.slug) - ordreRayon(y.slug))
}
