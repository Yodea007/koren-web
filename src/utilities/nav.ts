// Liens de navigation secondaires — source unique partagée par le menu (header) et le footer.
export type NavLink = { label: string; href: string }

export const NAV_EDITIONS: NavLink[] = [
  { label: 'Histoire depuis 1962', href: '/notre-histoire' },
  { label: 'Eliyahou Koren', href: '/eliyahou-koren' },
  { label: 'Nos auteurs', href: '/nos-auteurs' },
]

export const NAV_AIDE: NavLink[] = [
  { label: 'Espace libraires', href: '/libraires' },
  { label: 'Livraison & retours', href: '/livraison-et-retours' },
  { label: 'Suivi de commande', href: '/suivi-de-commande' },
  { label: 'Nous contacter', href: '/contact' },
  { label: 'Mentions légales', href: '/mentions-legales' },
]
