import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Lecture du global « Menu » (liste plate de liens) → regroupée par « groupe » (parent)
// pour le header/footer. L'ordre des groupes suit leur 1ʳᵉ apparition dans la liste.
export type MenuLien = { intitule: string; href: string }
export type MenuSection = { titre: string; liens: MenuLien[] }

export async function getMenu(): Promise<MenuSection[]> {
  const payload = await getPayload({ config: configPromise })
  const menu = await payload.findGlobal({ slug: 'menu', depth: 1 })

  const ordre: string[] = []
  const map = new Map<string, MenuLien[]>()

  for (const l of menu?.liens ?? []) {
    const groupe = (l.groupe ?? '').trim()
    if (!groupe || !l.intitule) continue

    let href = '#'
    if (l.typeLien === 'page' && l.page && typeof l.page === 'object' && l.page.slug) {
      href = `/${l.page.slug}`
    } else if (l.url) {
      href = l.url
    }
    if (href === '#') continue

    if (!map.has(groupe)) {
      map.set(groupe, [])
      ordre.push(groupe)
    }
    map.get(groupe)!.push({ intitule: l.intitule, href })
  }

  return ordre.map((titre) => ({ titre, liens: map.get(titre)! }))
}
