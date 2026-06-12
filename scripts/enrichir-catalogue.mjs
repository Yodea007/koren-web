// Croise les produits aspirés de Shopify avec le bon de commande 2026 (ISBN, dimensions)
// et produit editeur-livres/shopify/products-enriched.json + un rapport de comparaison.
// La table de correspondance est curée à la main : les titres diffèrent entre les deux sources.
// Usage : node scripts/enrichir-catalogue.mjs
import fs from 'node:fs'
import path from 'node:path'

const DATA = path.resolve(import.meta.dirname, '../editeur-livres')
const products = JSON.parse(fs.readFileSync(path.join(DATA, 'shopify/products.json')))
const catalogue = JSON.parse(fs.readFileSync(path.join(DATA, 'catalogue-2026.json'))).entries

// Titre Shopify → titre du bon de commande.
// Valeur objet = produit à variantes : titre de variante Shopify → titre du bon de commande.
const CORRESPONDANCE = {
  'Dignité de la différence': 'Dignité de la différence - J. Sacks',
  "Les Voix de l'Alliance 1 (Genèse et Exode)": "Les Voix de l'Alliance Tome 1 - J. Sacks",
  "Les Voix de l'Alliance 2 (Lévitique, Nombres, et Deutéronome)":
    "Les Voix de l'Alliance Tome 2 - J. Sacks",
  'Maximes des Pères (Pirké Avot) avec les commentaires du Rav Adin Éven-Israël Steinsaltz':
    'Pirké Avot - Steinsaltz',
  'Bible Hébreu-Français - Traduction du Grand-rabbin Zadoc Kahn':
    'Tanakh Koren (Bilingue Français / Hébreu)',
  'Bible Koren Classique - Édition Personnelle': 'Le Tanakh Classique de Koren (Bleue)',
  'Bible Koren Classique - Édition Moriya Petit Format': 'Le Tanakh Moriya de Koren',
  'Bible Koren Classique reliée en cuir - Cadeau et collector': 'Le Tanakh Prestige, grand format',
  'Bible Koren Classique - Édition Maalot': {
    Rose: 'Le Tanakh Maalot de Koren - Rose',
    Vert: 'Le Tanakh Maalot de Koren - Verte',
    Bleu: 'Le Tanakh Maalot de Koren - Bleue',
  },
  'Bible Koren Petit Format - Édition Magerman (couverture souple)':
    'Le Tanakh Magerman, bilingue Héb/Anglais (SC)',
  'Bible Koren Maalot - Édition Magerman Prestige':
    'Le Tanakh Maalot Magerman (Grand format) Héb/Ang',
  'Bible, Prophètes, et autres écrits - Koren Steinsaltz Tanakh HaMevoar (17 livres)':
    'Coffret HaTanakh HaMevoar Steinsaltz (17 vols)',
  'Bible - Koren Steinsaltz Tanakh HaMevoar (5 livres)': 'Houmash HaMevoar Steinsaltz (5 vols)',
  'Talmud Bavli Steinsaltz (29 livres)': 'Talmud Bavli Steinsaltz (29 volumes)',
  'Michné Torah Rambam - Commentaires Steinslatz (8 livres)':
    'Michné Torah Rambam - Steinsaltz (8 volumes)',
  'Mishna HaMivueret Steinsaltz (13 livres)': 'Mishna HaMevueret Steinsaltz (13 volumes)',
  "Siddour Koren Shalem Bilingue - Tradition Ashkénaze ou Sfard (Europe de l'Est)": {
    'Hébreu/Anglais - Ashkénaze': 'Siddour Shalem Koren, Héb/Anglais, Ashkénaze',
    'Hébreu/Anglais - Sfard (Europe de l\'Est)': 'Siddour Shalem Koren, Héb/Anglais, Sfard',
    'Hébreu/Espagnol - Ashkénaze': 'Siddour Shalem Koren, Héb/Espagnol, Ashkénaze',
    'Hébreu/Allemand - Ashkénaze': 'Das Koren-Schalem Siddur, Héb/Allemand, Ashkénaze',
  },
  'Siddour Koren Kol Yaakob Bilingue - Tradition Syrienne': {
    'Hébreu/Anglais': 'Siddour Kol Yaakob, Héb/Anglais, Sépharade',
    'Hébreu/Espagnol': 'Siddour Kol Yaakob, Héb/Espagnol, Sépharade',
  },
  'Coffret 3 Mahzorim Koren Classiques': {
    Sépharade: 'Coffret Mahzor Koren, Sépharade',
    Ashkénaze: 'Coffret Mahzor Koren, Ashkénaze',
    'Edot HaMizra’h': 'Coffret Mahzor Koren, Sépharade (Edot HaMizrah)',
  },
  // ISBN du bon de commande = édition française ; la variante Hébreu n'a pas d'ISBN connu
  'Esther Méguila Bilingue - Récit Graphique': {
    Français: 'Esther, la Méguila - récit graphique',
  },
  'Jonas Récit Graphique': 'Jonas - récit graphique',
  'Haggada Récit graphique': 'Haggada - récit graphique',
  'Mes premières histoires du Tanakh - Coffret de 4 livres':
    'Mes premières histoires du Tanakh (coffret 4 livres)',
  'Une rencontre peu orthodoxe, Naomi Ragen': 'Une rencontre peu orthodoxe - Naomi Ragen',
  Sotah: 'Sotah - Naomi Ragen',
  'Fille de Jephté': 'Fille de Jephté - Naomi Ragen',
  'Le silence de Tamar': 'Le silence de Tamar - Naomi Ragen',
  'Les sœurs Weiss': 'Les soeurs Weiss - Naomi Ragen',
  'Le dixième chant': 'Le dixième chant - Naomi Ragen',
  'Le serment': 'Le serment - Naomi Ragen',
  'Le fantôme de Doña Gracia Mendes': 'Le fantôme de Doña Gracia Mendes - Naomi Ragen',
  'Lunes d’automne': "Lunes d'automne - H. Sabato",
}

const isbnValide = (isbn) => {
  if (!/^\d{13}$/.test(isbn)) return false
  const somme = [...isbn].reduce((s, c, i) => s + Number(c) * (i % 2 ? 3 : 1), 0)
  return somme % 10 === 0
}

const parTitre = new Map(catalogue.map((e) => [e.titre, e]))
const utilisés = new Set()
const écartsPrix = []

const lookup = (titrePdf, prixShopify, contexte) => {
  const entrée = parTitre.get(titrePdf)
  if (!entrée) throw new Error(`Titre introuvable dans le bon de commande : ${titrePdf}`)
  utilisés.add(titrePdf)
  if (Number(prixShopify) !== entrée.prix)
    écartsPrix.push(`${contexte} : ${prixShopify}€ sur Shopify, ${entrée.prix}€ au catalogue 2026`)
  return entrée
}

// Réconciliation : le code-barres Shopify (par variante) et l'ISBN du bon de commande
// doivent coïncider ; en cas de désaccord on garde le code-barres Shopify et on signale.
const conflits = []
const réconcilier = (v, entréePdf, contexte) => {
  const barcode = v.barcode || null
  const pdf = entréePdf?.isbn ?? null
  if (barcode && pdf && barcode !== pdf)
    conflits.push(`${contexte} : Shopify ${barcode} ≠ bon de commande ${pdf}`)
  v.isbn = barcode || pdf
}

for (const p of products) {
  const corr = CORRESPONDANCE[p.title]
  if (typeof corr === 'string') {
    const e = lookup(corr, p.variants[0].price, p.title)
    réconcilier(p.variants[0], e, p.title)
    p.isbn = p.variants[0].isbn
    p.dimensions = e.dimensions ?? null
    p.prix_catalogue_2026 = e.prix
  } else {
    for (const v of p.variants) {
      const titrePdf = corr?.[v.title]
      const e = titrePdf ? lookup(titrePdf, v.price, `${p.title} / ${v.title}`) : null
      réconcilier(v, e, `${p.title}${p.variants.length > 1 ? ` / ${v.title}` : ''}`)
      if (e) p.dimensions ??= e.dimensions ?? null
    }
    if (p.variants.length === 1) p.isbn = p.variants[0].isbn
  }
}

fs.writeFileSync(
  path.join(DATA, 'shopify/products-enriched.json'),
  JSON.stringify(products, null, 2),
)

// ---- Rapport ----
const sansIsbn = products.filter((p) => !p.isbn && !p.variants.some((v) => v.isbn))
const pdfSeuls = catalogue.filter((e) => !utilisés.has(e.titre) && !e.note?.includes('doublon'))
const isbnInvalides = catalogue
  .filter((e) => !isbnValide(e.isbn))
  .concat(products.flatMap((p) => p.variants.filter((v) => v.isbn && !isbnValide(v.isbn))
    .map((v) => ({ titre: `${p.title} / ${v.title}`, isbn: v.isbn }))))

console.log(`Produits Shopify avec ISBN : ${products.length - sansIsbn.length}/${products.length}`)
console.log(`\n— Conflits d'ISBN entre Shopify et le bon de commande :`)
conflits.forEach((l) => console.log(`  • ${l}`))
console.log(`\n— Toujours sans aucun ISBN :`)
sansIsbn.forEach((p) => console.log(`  • ${p.title}`))
console.log(`\n— Au bon de commande mais absents de Shopify :`)
pdfSeuls.forEach((e) => console.log(`  • ${e.titre} (${e.prix}€)`))
console.log(`\n— Écarts de prix :`)
écartsPrix.forEach((l) => console.log(`  • ${l}`))
console.log(`\n— ISBN au format invalide (somme de contrôle) :`)
isbnInvalides.forEach((e) => console.log(`  • ${e.titre} : ${e.isbn}`))
const vus = new Map()
console.log(`\n— ISBN en doublon dans le bon de commande :`)
for (const e of catalogue) {
  if (vus.has(e.isbn) && !e.note?.includes('doublon'))
    console.log(`  • ${e.isbn} : « ${vus.get(e.isbn)} » et « ${e.titre} »`)
  vus.set(e.isbn, e.titre)
}
