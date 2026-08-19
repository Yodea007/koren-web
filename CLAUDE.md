# Koren France — guide du projet (Claude Code)

Boutique en ligne de la maison d'édition **Koren France** (marques *Koren · Maggid · The Toby Press*) :
bibles/Tanakh, livres de prières, Talmud, essais, littérature, jeunesse. Vente au public **et** aux libraires.

**Stack** : Payload CMS 3.85 + Next.js 16 (App Router) + PostgreSQL (Neon) + Vercel (région `lhr1`, co-localisée avec la DB `eu-west-2`).

---

## Démarrer

- **npm**, jamais pnpm : `npm run dev` · `npm run build` · `npm run generate:types` · `npm run generate:importmap`
- Données persistantes (médias, Postgres docker-compose) → dossier `editeur-livres/` à la racine (**gitignoré**, jamais commité)
- DB pilotée par `DATABASE_URI` ; SSL via `?sslmode=require` dans l'URL (rien en dur)
- ⚠️ **Le `.env` local pointe sur la MÊME base Neon de PROD** : tout script de données lancé en local affecte la prod.
- ⚠️ Ajouter/modifier une collection ⇒ **push drizzle interactif** au boot du dev (prompts rename/data-loss). Ajout de colonnes/tables nullable = non destructif. Puis `npm run generate:types`.
- Compétence Payload : commencer par `.claude/skills/payload/SKILL.md`, détails dans `.claude/skills/payload/reference/`.

---

## Convention de commentaires (à suivre pour toute nouvelle page)

Pour pouvoir suivre l'acheminement **sans entrer dans le code** :

1. **En-tête de chaque `page.tsx`** : un bloc encadré « Acheminement » qui liste, dans l'ordre, les étapes data
   puis les blocs de rendu. Modèles : [layout.tsx](src/app/(frontend)/layout.tsx) et [page.tsx](src/app/(frontend)/page.tsx).
2. Dans le corps : marquer les sections par `// ===== A. DONNÉES =====` puis `// ===== B. RENDU =====`,
   et chaque bloc visuel par `{/* BLOC 1 — … */}`.
3. **Points d'entrée** : commenter chaque composant appelé dans le JSX (`<Header />` → à quoi il sert).
4. Les **fonctions principales** portent un commentaire d'une ligne décrivant leur rôle (pas le détail d'implémentation).

---

## Carte des routes — `src/app/(frontend)/`

| Route | Fichier | Rôle |
|---|---|---|
| `/` | `page.tsx` | Accueil : Hero + rails par rayon + sélection |
| `/catalogue` | `catalogue/page.tsx` | Catalogue filtrable (`?rayon=`, `?nouveaute=1`), paginé, mis en cache (`unstable_cache`, tag `catalogue`) |
| `/livres/[slug]` | `livres/[slug]/page.tsx` | Fiche produit (SEO/JSON-LD) + `FicheAchat.tsx` (choix édition/couleur + « Ajouter au panier ») |
| `/[slug]` | `[slug]/page.tsx` | **Pages statiques** (collection `Pages`) : « Notre histoire », CGV, etc. |
| `/posts`, `/posts/[slug]`, `/posts/page/[n]` | `posts/…` | Blog / actualité |
| `/search` | `search/page.tsx` | Recherche (`?q=`) |
| `/libraires` | `libraires/page.tsx` (stub → `src/libraires/`) | Espace libraires : bon de commande en ligne + lien PDF tarif |
| `/bon-de-commande.pdf` | `bon-de-commande.pdf/route.ts` (stub → `src/libraires/`) | PDF tarif vierge, toujours à jour |
| `/panier` | `panier/page.tsx` + `PanierClient.tsx` | Panier réel : récap, quantités, port estimé, « Commander » |
| `/commande/merci`, `/commande/annulee` | `commande/…` | Retour Stripe : merci (vide le panier + récap session) / annulée |
| `/compte` | `compte/page.tsx` | **Placeholder** (comptes clients = plus tard) |
| `/api/checkout` | `api/checkout/route.ts` | POST panier → session Stripe Checkout (recalcul serveur via `resoudrePanier`) |
| `/api/stripe/webhook` | `api/stripe/webhook/route.ts` | `checkout.session.completed` → commande + reçu PDF + e-mail |
| `/api/bon-de-commande` | `api/…/route.ts` (stub → `src/libraires/`) | POST commande libraire → fiche Payload + e-mail + PDF |
| `/api/revalidate` | `api/…/route.ts` | Revalidation (cron minuit + bouton admin). Auth Bearer `CRON_SECRET` ou session admin |
| `/next/preview`, `/next/exit-preview` | `next/…` | Aperçu brouillons (live preview Payload) |
| `(sitemaps)/*.xml` | `(sitemaps)/…` | Sitemaps livres / pages / posts |

---

## Collections & globals (`src/collections`, `src/*/config.ts`)

- **Livres** : catalogue. Onglets « Le livre » / « SEO ». Déclinaisons (éditions/ISBN). Colonnes admin de qualité
  (`État fiche`, `SEO`) + encadré récap (`components/admin/FicheChecklist`). Hooks de revalidation.
- **Categories** (rayons ; titres éditables : `title` long + `titreCourt` pour les menus ; champ `ordre` = position
  dans barre/footer/accueil, fallback `CATEGORIE_ORDRE` de `koren.ts` pour les fiches sans numéro), **Auteurs**, **Lots** (offres groupées),
  **Posts** (blog), **Pages** (pages statiques ; blocs dont « Image + Texte » responsive, images dans le texte),
  **Media** (compression auto à l'upload : ≤ 2000 px + WebP q80), **Users**, **Commandes** (= commandes **libraires**,
  définie dans `src/libraires/Commandes.ts`), **CommandesClient** (= commandes **en ligne**, créées par le webhook Stripe uniquement).
- **Module `src/libraires/`** : tout l'espace libraires en un seul endroit, façon plugin — page, formulaire,
  gabarits PDF, collection `Commandes`, handlers d'API. Les routes sous `src/app/` sont des stubs d'une ligne.
  Voir `src/libraires/README.md`.
- Globals : **Hero** (diaporama accueil), **Menu** (liens de nav éditables en back-office : liste plate de liens avec
  « groupe » parent en texte libre, lien = page du site ou URL ; consommé par header ☰, footer et `Header/MenuDrawer`
  via `utilities/menu.ts`). Les anciens globals **Header/Footer** du template (navItems jamais affichés) ont été supprimés ;
  les composants React `src/Header/Component.tsx` et `src/Footer/Component.tsx` restent, alimentés par Categories + Menu.

---

## Fonctions / utilitaires clés (`src/utilities`)

- **`koren.ts`** : `formatPrix`, `couverture`, `labelCategorieCourt`/`ordreCategorie` (les 6 rayons), libellés langue/rite/reliure.
- **`menu.ts`** : `getMenu()` lit le global **Menu** (liens de nav) — remplace l'ancien `nav.ts` (supprimé).
- **`tarif.ts`** : `articlesDeLivre(livre)` aplatit un livre en lignes vendables (une par déclinaison, fallback livre)
  avec un **`ref` stable** (`livre-{id}` ou `livre-{id}-{i}`) — **clé commune au panier et au bon de commande**.
- **`commerce.ts`** : règles boutique — TVA livres 5,5 %, `fraisDePort()` (forfait + gratuité ≥ 60 €),
  `tvaIncluse()`/`montantHT()`, conversions centimes Stripe. **Constantes à confirmer en tête de fichier.**
- **`providers/Cart`** : contexte panier (localStorage) — `add/setQte/remove/clear`, `count`, `sousTotal`. `useCart()`.
- **`hooks/revalidateLivre.ts`**, **`revalidateAccueil.ts`** : régénèrent accueil/fiche/catalogue/sitemap sur édition admin.

---

## Performance & SEO — **FAIT, ne pas refaire**

Site optimisé (mobile ~90, a11y ~99, best-practices 100, SEO 100), au-dessus de l'ancienne version Shopify.
Déjà en place : compression média auto, logo SVG, `priority` sur le hero, hero en q70, CLS du swiper à 0,
données structurées Organization + WebSite, en-têtes de sécurité, dorés WCAG AA (`text-or` foncé + `text-or-clair`).

**Faux positifs Lighthouse à IGNORER** (vérifiés) :
- « LCP en lazy / sans priority » → faux : le `<link rel=preload>` + `<img>` eager sont bien dans le HTML servi.
  Lighthouse confond avec une couverture produit nommée « Jonas ».
- « Polyfills 14 Ko » → bundle `nomodule` de Next, jamais téléchargé par un navigateur moderne. Non configurable.
- « sizes → 750px » → mauvais conseil : casserait la bannière plein écran sur desktop. `100vw` est correct.

---

## 🔧 CHANTIER EN COURS — Paiement en ligne (Stripe)

**Décisions validées** : Stripe Checkout **hébergé** (redirection) · **achat invité** uniquement ·
**cartes + Apple/Google Pay** (PayPal ajoutable plus tard, via Stripe) · port **forfait + gratuit ≥ 60 €**.
*(Axepta/BNP gardé en réserve si le volume justifie un jour de négocier les frais.)*

**Décisions appliquées** : port **4,90 € · offert dès 60 €** (`commerce.ts`) · livraison **France + Monaco** seulement.

**Construit (code complet ; build + typecheck OK)** :
- `utilities/commerce.ts` (TVA + port) · `providers/Cart` · `Header/CartCount` · SDK `stripe`.
- Collection **`CommandesClient`** (slug `commandes-client`) : réf, client, adresse, lignes, sous-total/port/total/TVA,
  statut, `stripeSessionId`. Créée **uniquement** par le webhook (Local API) ; `create: () => false`. Schéma poussé + types OK.
- `utilities/panier.ts` → **`resoudrePanier()`** : recalcul serveur prix/port/TVA depuis Payload (source de vérité),
  partagé par checkout **et** webhook. `utilities/stripe.ts` → client Stripe (null si clé absente → 503 propre).
- Boutons **« Ajouter au panier »** : `FicheAchat.tsx` (ref aligné sur `articlesDeLivre`) + `BookCard` via
  `components/koren/AddToCartButton.tsx` (ajout direct si 1 édition, sinon « Choisir » → fiche).
- Page **`/panier`** réelle (`panier/PanierClient.tsx`) : récap, quantités, port estimé, « Commander ».
- **`POST /api/checkout`** : `resoudrePanier` + `stripe.checkout.sessions.create` (mode payment, locale fr,
  shipping FR/MC, port en `shipping_options`, `ref` dans la metadata produit).
- **`POST /api/stripe/webhook`** : vérif signature, `checkout.session.completed` → reconstitue le panier via
  `listLineItems` (metadata `ref`), crée la commande (**idempotent** sur `stripeSessionId`), puis via `after()` :
  génère un **reçu PDF** (`components/commande/RecapCommandePdf.tsx`), le stocke sur la commande (champ `pdf`)
  et l'envoie en pièce jointe de l'e-mail (client en « À », `e.alhadef@gmail.com`/`COMMANDES_EMAIL` en **Cci**).
  ⚠️ Reçu ≠ facture légale (pas de SIRET / TVA intracom) — à compléter avec les infos société.
- Pages **`/commande/merci`** (vide le panier, récap session) et **`/commande/annulee`**.

**Fait depuis** : compte Stripe créé, clés **mode Test** (`sk_test_…`, `pk_test_…`, `whsec_…`) en place dans le `.env` local.
Vérifié (août 2026, `vercel env ls`) : `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, SMTP, `COMMANDES_EMAIL`
et `NEXT_PUBLIC_SERVER_URL` **déjà posées sur Vercel** (Preview + Production).

**Reste à faire** :
- **Test réel de bout en bout** en mode Test (panier → Checkout → webhook → commande + reçu PDF + e-mail).
  En local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- **Vercel** : il ne manque QUE `STRIPE_WEBHOOK_SECRET` → créer l'endpoint webhook côté Stripe
  (évènement `checkout.session.completed`) et reporter son `whsec_…`.
- **Passage en mode Live** (clés `sk_live_…`) une fois le légal en place.
- ⚠️ **Légal avant d'encaisser** : CGV, mentions légales, confidentialité RGPD, retours (voir feuille de route).

---

## 📋 Feuille de route (TODO)

1. **Finaliser le paiement Stripe** (chantier ci-dessus).
2. **Pages statiques** via la collection `Pages` : « Notre histoire » ✓. Pages **provisoires créées** (contenu « à compléter » à
   remplir dans l'admin) : `eliyahou-koren`, `nos-auteurs`, `livraison-et-retours`, `suivi-de-commande`, `contact`, `mentions-legales`.
   ⚠️ Contenu légal réel (CGV, mentions, RGPD, retours) reste à rédiger avant d'encaisser.
3. **Actualité** : enrichir/animer le blog (collection `Posts`).
4. **Charte graphique** : unifier et embellir (typo, espacements, composants cohérents).
5. **Accessibilité mobile** : ✓ **menu hamburger** (`Header/MenuDrawer.tsx`, toutes tailles), ouvert depuis la **barre de
   catégories** (`CategoriesNav`, à gauche) ; liens pilotés par le global **Menu** (via `utilities/menu.ts`), partagés
   header + footer. Reste : zones tactiles, focus, lecture écran.
6. **Connecteur MCP (Claude ↔ site)** : exposer le site via un **serveur MCP** pour piloter le contenu/les données
   en conversation (ex. « ajoute ce livre », « commandes du jour », « publie cet article »). Pistes : envelopper
   l'API Payload (Local API / REST / GraphQL) dans un serveur MCP (vérifier s'il existe un MCP Payload communautaire) ;
   cadrer l'**auth** (clé API en lecture seule vs écriture) et le périmètre exposé. À concevoir après le paiement.

**Ajouts recommandés (vus en plus de ta liste)** :
- ⚖️ **Légal — OBLIGATOIRE avant d'encaisser** : **CGV**, **mentions légales**, **politique de confidentialité (RGPD)**,
  **politique de retour/remboursement** ; **bandeau cookies** si analytics/tracking ; consentement newsletter.
  → à créer en pages statiques (`Pages`) avant la mise en ligne du paiement.
- **E-mails transactionnels** soignés (confirmation de commande, expédition) + éventuelle **facture PDF** (modèle bon de commande).
- **Analytics** (ex. Plausible ou GA4) pour mesurer ventes/conversion.
- **Disponibilité/stock** : aujourd'hui simple booléen `disponible` ; prévoir si gestion de quantités un jour.
- **Comptes clients** (historique commandes) : reporté après la v1 invité.

---

## 🗂️ Organisation de l'admin (nav visée)

Les groupes de la nav admin se pilotent par `admin.group: '<Nom>'` sur chaque collection/global
(pur cosmétique, aucune migration). Nav cible validée avec le client :

```
📚 Catalogue        → Livres · Categories · Lots
✍️  Auteurs          → Auteurs (+ à enrichir : vidéos, actualités, interviews)
📰 Actualités        → Posts (blog)
📄 Contenu           → Pages (Notre histoire, CGV, mentions…)
⭐ Mise en avant     → Hero (+ à créer : Bannières/Promos)
🏪 Libraires         → Commandes libraires (+ à créer : Magasins, relié aux commandes)
🛒 Ventes            → CommandesClient (commandes en ligne ✓) (+ à créer : Clients)
✉️  Newsletter        → (abonnés via form-submissions ; ENVOI délégué à Brevo/Mailchimp, NE PAS recoder un ESP)
🖼️  Médias           → Media
👤 Administration    → Users
⚙️  Paramètres        → Menu (+ à créer : global « Réglages » : forfait port + seuil gratuité
                        aujourd'hui en dur dans commerce.ts, contact, réseaux ; + page d'aide liens API/DB)
```

**Statut** : structure **validée mais NON appliquée**. Un essai d'`admin.group` a été annulé (la nav groupée
par défaut de Payload est jugée trop moche) → à refaire **proprement pendant l'étape charte graphique**
(thème admin custom + regroupement), pas en l'état brut. Le schéma ci-dessus reste la cible.

**Reste à créer** (pendant/après le paiement) : collections **Magasins**, **Clients**,
**Bannières/Promos**, global **Réglages** ; enrichir **Auteurs** (vidéos/interviews) ; intégrer **Brevo** pour la newsletter.
*(« Commandes en ligne » = collection `CommandesClient`, déjà créée avec le paiement Stripe.)*

**Vigilance** : RGPD dès qu'on stocke des Clients (registre, droit à l'effacement) ; pages légales = prérequis vente.
