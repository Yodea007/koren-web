import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Lecture du global « Menu » → structure simple (sections + liens résolus) pour le header/footer.
export type MenuLien = { intitule: string; href: string }
export type MenuSection = { titre: string; liens: MenuLien[] }

export async function getMenu(): Promise<MenuSection[]> {
  const payload = await getPayload({ config: configPromise })
  const menu = await payload.findGlobal({ slug: 'menu', depth: 1 })

  return (menu?.sections ?? [])
    .map((s) => ({
      titre: s.titre ?? '',
      liens: (s.liens ?? [])
        .map((l) => {
          let href = '#'
          if (l.typeLien === 'page' && l.page && typeof l.page === 'object' && l.page.slug) {
            href = `/${l.page.slug}`
          } else if (l.url) {
            href = l.url
          }
          return { intitule: l.intitule ?? '', href }
        })
        .filter((l) => l.intitule && l.href !== '#'),
    }))
    .filter((s) => s.titre && s.liens.length > 0)
}
