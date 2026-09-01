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
- **`commerce.ts`** : règles boutique — TVA livres 5,5 %, `fraisDePort()` (forfait + seuil de gratuité **pilotés
  par le global « Réglages »** via `utilities/reglages.ts` ; constantes de repli 4,90 € / 75 €),
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

**Décisions appliquées** : port **4,90 € · offert dès 75 €** — modifiables dans l'admin (global **Réglages**,
  affiché sous l'icône panier du header ET utilisé par le calcul panier/Stripe) · livraison **France + Monaco** seulement.

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
- ✅ **Test de bout en bout validé** (août 2026, mode Test, sans navigateur) : panier réel → `POST /api/checkout`
  (session Stripe créée) → évènement `checkout.session.completed` forgé et signé avec le `whsec_` local →
  commande créée avec lignes/port/TVA corrects + reçu PDF attaché + idempotence vérifiée (renvoi → `duplicate`).
  E-mail non testé en local (pas de SMTP dans le `.env`) — actif en prod (SMTP sur Vercel).
  Commande de test supprimée de la base après vérification.
- ✅ **Vercel/Stripe prod : tout est en place** (vérifié août 2026) : `STRIPE_WEBHOOK_SECRET` posé,
  endpoint webhook actif côté Stripe (`checkout.session.completed` → koren-web.vercel.app), le webhook prod
  répond 400 « signature manquante » à une requête non signée (= configuré). Le circuit tourne en **mode Test** :
  une commande réelle avec la carte 4242 4242 4242 4242 est possible sur le site en ligne.
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
6. ✅ **Connecteur MCP (Claude ↔ site)** — fait (août 2026) avec le plugin officiel `@payloadcms/plugin-mcp`
   (version épinglée = version de Payload). Serveur exposé sur **`/api/mcp`** (local ET prod, aucune infra en plus).
   Périmètre (`src/plugins/index.ts`) : livres/auteurs/posts en find+create+update ; categories/pages/lots/
   commandes/commandes-client en **lecture seule** ; **aucune suppression**. Auth par clé API (admin →
   groupe « MCP » → API Keys, clé « Claude (conversation) » liée au 1ᵉʳ admin ; recréation :
   `npx payload run scripts/creer-cle-mcp.ts`, la clé locale est dans `.env` → `MCP_KOREN_API_KEY`).
   ⚠️ Pièges appris : le plugin **camelise** les slugs dans les groupes de capacités de la clé
   (`commandes-client` → `commandesClient`) ; l'argument `where` des tools est une **chaîne JSON**, pas un objet ;
   l'**upload de fichiers n'est pas supporté** par MCP (photos → via l'admin ; `findMedia` permet ensuite de lier).
   **Clients branchés** : Claude Code (serveur `koren`, scope local) et Claude Desktop
   (`claude_desktop_config.json` → `mcp-remote` vers la prod, header via env `AUTH_HEADER`).
   Mobile/claude.ai : connecteur personnalisé avec en-tête `Authorization` (bêta « Request headers » en déploiement).
7. **📣 Diffusion réseaux sociaux** (plan validé sept. 2026, en 3 briques) :
   1. ✅ **Visuels générés automatiquement** (sept. 2026) : route `/livres/[slug]/visuel/{og|carre|story}`
      (ImageResponse `next/og`, charte bordeaux/or, police Cormorant en TTF dans `src/fonts/`) — `og` 1200×630
      branché dans `generateMetadata` (og:image + balises Twitter ; la carte générée remplace **toujours**
      `meta.image`, les avertissements « Image de partage manquante » ont été retirés de la checklist et de la
      colonne SEO), `carre` 1080×1080 et `story` 1080×1920 pour Instagram ; `?dl=1` = téléchargement.
      Couverture = 1ʳᵉ image du livre en data URI ; mockups carrés (marges) → zoom ×1,5 auto (ratio 0,85–1,3) ;
      modèle de référence = photos recadrées serré (ex. « Un judaïsme engagé dans le monde »). En dev, médias
      absents du disque → repli sur koren-web.vercel.app. Vérifié en local sur les 3 formats (rendu contrôlé).
   2. **Kit réseaux dans l'admin** (à faire) : encadré « Réseaux sociaux » sur la fiche livre (sidebar,
      comme `FicheChecklist`) — lien de la fiche à copier, gabarits de posts Instagram/Facebook remplis
      depuis la fiche (titre, accroche, auteur, prix, hashtags), boutons de téléchargement des visuels
      carré/story, prompts image et vidéo (Reel 15 s) prêts à copier pour la personne qui publie.
      Gabarits automatiques d'abord (sans API) ; bouton « Rédiger avec Claude » (API Anthropic) possible plus tard.
   3. **Base de connaissance interne** (à faire) : Payload = mémoire de la maison. Onglet interne sur
      **Livres** (argumentaire, contexte éditorial, anecdotes/citations, ressources presse, notes libres)
      + champs enrichis sur **Auteurs** (parcours, thèmes, interviews). **Invisible du public**
      (field-level access `read: authentifié` + jamais rendu sur le front) mais **pleinement accessible
      via MCP** : Claude lit/enrichit ces champs pour concevoir fiches, posts, vidéos ; les gabarits de
      la brique 2 y puisent quand ils sont remplis. Colonnes nullable = migration non destructive.

**Ajouts recommandés (vus en plus de ta liste)** :
- ⚖️ **Légal — OBLIGATOIRE avant d'encaisser** : **CGV**, **mentions légales**, **politique de confidentialité (RGPD)**,
  **politique de retour/remboursement** ; **bandeau cookies** si analytics/tracking ; consentement newsletter.
  → à créer en pages statiques (`Pages`) avant la mise en ligne du paiement.
- **E-mails transactionnels** soignés (confirmation de commande, expédition) + éventuelle **facture PDF** (modèle bon de commande).
- **Analytics** (ex. Plausible ou GA4) pour mesurer ventes/conversion.
- **Disponibilité/stock** : aujourd'hui simple booléen `disponible` ; prévoir si gestion de quantités un jour.
- **Comptes clients** (historique commandes) : reporté après la v1 invité.

---

## 🗂️ Organisation de l'admin — ✅ APPLIQUÉE (août 2026)

Nav groupée par `admin.group` (collections + globals + overrides de plugins dans `src/plugins/index.ts`),
habillage dans `src/app/(payload)/custom.scss` (boutons bordeaux, titres de groupes or, petites capitales),
logo Koren à la connexion (`components/admin/LogoKoren` + `IconeKoren`, via `admin.components.graphics`).
L'ordre des groupes = ordre du tableau `collections` de payload.config.ts.

```
📚 Édition          → Livres · Auteurs · Catégories · Lots · Articles (posts) · Pages · Hero
🛒 Ventes           → Commandes en ligne · Commandes libraires
✉️ Newsletter        → Inscriptions (form-submissions) · Formulaires
🖼️ Médias            → Media
⚙️ Paramètres        → Réglages · Menu · Redirections
👤 Administration    → Utilisateurs
🧰 Technique         → Index de recherche · Exports   (le « mode expert », accessible mais discret)
MCP                  → Clés API (groupe imposé par le plugin)
```

**Reste à créer un jour** : collections **Magasins**, **Clients**, **Bannières/Promos** ;
enrichir **Auteurs** (vidéos/interviews) ; champs réseaux sociaux dans **Réglages** ; **Brevo** pour l'envoi newsletter.

**Vigilance** : RGPD dès qu'on stocke des Clients (registre, droit à l'effacement) ; pages légales = prérequis vente.
