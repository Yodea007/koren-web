# Todo lancement korenfrance.com — état au 22 août 2026

Liste consolidée (audit + todo client + travaux réalisés). Les items barrés sont faits et vérifiés en prod.

## 1. Bloquant — avant d'ouvrir le domaine

| # | Tâche | Détail | Qui | Prio |
|---|---|---|---|---|
| 1 | CGV | Bloquées : arbitrage rétractation (14 ou 30 j) + adresse de retour | Emmanuelle | 🔴 |
| 2 | Livraison & retours | Même blocage | Emmanuelle | 🔴 |
| 3 | Médiateur de la consommation | Nom + coordonnées dans les mentions légales | Emmanuelle | 🔴 |
| 4 | ~~h1 unique par page~~ | ✅ fait (accueil en `sr-only`) | Code | — |
| 5 | ~~Balise canonical~~ | ✅ fait sur toutes les pages (les fiches livres l'avaient déjà) | Code | — |
| 6 | ~~Alt text images produit~~ | ✅ fait — l'audit n'a trouvé qu'1 manquant, corrigé | Admin | — |
| 7 | ~~Barre d'admin masquée~~ | ✅ vérifié : div vide `hidden`, rien de sensible sans session | Code | — |
| 8 | Tunnel Stripe en clés live | Carte OK / refusée / 3DS / e-mail / **facture légale (SIRET, TVA — le reçu actuel ne suffit pas)** | Code + Emmanuelle | 🔴 jour J |
| 9 | SSL actif dès le changement DNS | Automatique chez Vercel à l'ajout du domaine — à provisionner avant | Code | 🔴 jour J |
| 10 | ~~Seuil port 60 → 75 €~~ | ✅ fait — global « Réglages » (admin) pilote affichage ET calcul, testé | Code | — |
| 11 | ~~Pages fantômes 13/14~~ | ✅ fait (la #13 contenait 4 corrections de coquilles, récupérées dans « Notre histoire ») | Admin | — |
| 12 | Mention « Retour 30 jours » | À **aligner sur les CGV** (30 j est légal ; c'est une question de cohérence, pas de suppression) | Code après arbitrage | 🟠 |

Note : bandeau cookies **abandonné** (Stripe hébergé + analytics Vercel sans cookies = rien à consentir). La politique de confidentialité doit l'expliquer.

## 2. Migration de domaine (jour J)

| # | Tâche | Détail | Qui | Prio |
|---|---|---|---|---|
| 0 | Relever le trafic organique réel | Shopify Analytics + Search Console, 12 mois | Emmanuelle | 🔴 |
| 1 | Cartographier URL Shopify → nouvelles | Générable par script via `shopifyHandle` (39/41) — l'infra de redirections est en place et éprouvée | Code | 🔴 |
| 2 | Redirections 301 | Via la collection Redirects (déjà branchée sur livres/posts/pages) | Code | 🔴 |
| 3 | Sitemap → korenfrance.com | Automatique via `NEXT_PUBLIC_SERVER_URL` (bug de protocole corrigé) | Code | 🔴 |
| 4 | Aucun lien interne vers vercel.app | Grep final avant bascule | Code | 🔴 |
| 5 | Liens externes (réseaux, Google Business, annuaires) | | Emmanuelle | 🟠 |
| 6 | korenfrance.com dans Search Console + outil « Changement d'adresse » | | Emmanuelle | 🟠 |
| 7 | Export des positions avant coupure | Si la tâche 0 révèle un trafic significatif | Emmanuelle | 🟡 |

## 3. Après la bascule

| # | Tâche | Détail | Qui | Prio |
|---|---|---|---|---|
| 1 | Webhook Stripe en mode **Live** | ⚠️ l'endpoint Test ne reçoit pas les évènements Live — en créer un second + reporter son `whsec_` | Code | 🔴 |
| 2 | Analytics / Search Console transférés | | Code | 🔴 |
| 3 | Plan de retour arrière documenté | Repointer le DNS vers Shopify (garder la boutique Shopify active quelques semaines) | Code | 🔴 |
| 4 | Astreinte renforcée 48 h | Paiement, e-mails, formulaires | Emmanuelle | 🟠 |
| 5 | Audit Lighthouse sur le domaine définitif | | Code | 🟠 |
| 6 | Suivi d'indexation 2-3 semaines | | Emmanuelle | 🟡 |

## 4. Contenu — reste à faire

| # | Tâche | Détail | Qui | Prio |
|---|---|---|---|---|
| 1 | ~~Meta des 13 articles~~ | ✅ générées (titre + description, artefacts Shopify nettoyés) | — | — |
| 2 | ~~Pages Notre histoire / Nos auteurs~~ | ✅ Notre histoire rédigée ; Nos auteurs = page dynamique (liste → fiches) | — | — |
| 3 | Recréer Haïm Sabato ? | Contradiction avec la suppression volontaire — à arbitrer. Sa bio est récupérable | Emmanuelle | 🟠 |
| 4 | ~~Rattacher les auteurs manquants~~ | ✅ Michné Torah → Steinsaltz (Lunes d'automne → Sabato en attente de l'arbitrage #3) | — | — |
| 5 | Droits des photos auteurs | Photos uploadées ✅ — droits à confirmer (Koren Jerusalem / Sacks Legacy Trust / N. Ragen) | Emmanuelle | 🟠 |
| 6 | Images manquantes | 31 fiches sur 41 n'ont qu'une image ; coffret sans photo de coffret | Admin | 🟠 |
| 7 | Renseigner `parCarton` | 39 livres — données à demander à Koren Jerusalem | Données Koren | 🟠 |
| 8 | Renseigner `rite` | Siddourim et Mahzorim | Données Koren | 🟠 |
| 9 | ~~Poids du coffret~~ | ✅ 500 → 2 000 g (nb : le port est forfaitaire, rien n'était « sous-facturé ») | — | — |
| 10 | Poids déclinaison Esther Hébreu | Donnée à obtenir | Données Koren | 🟠 |
| 11 | Cocher `selection` | La section « Mise en avant » a un repli (4 plus récents) mais mérite une vraie curation | Emmanuelle | 🟠 |
| 12 | Dimensions (8 livres) et pages (14 livres) | Données à obtenir ; les dimensions s'ajouteront alors au bloc caractéristiques | Données Koren | 🟠 |
| 13 | ~~Bloc caractéristiques~~ | ✅ ISBN (par édition) / pages / poids sur chaque fiche | — | — |
| 14 | ~~Médaillon auteur + lien bio~~ | ✅ avec repli initiales | — | — |
| 15 | Compresser les anciennes images | Jusqu'à 5,4 Mo PNG → WebP < 500 Ko (les nouveaux uploads sont déjà compressés) | Code | 🟠 |
| 16 | Revoir les nouveautés | 8 cochées dont 3 Haggadot en période de Roch Hachana | Emmanuelle | 🟡 |
| 17 | Cross-catégoriser | Haggada / Esther Méguila absentes du rayon Fêtes | Admin/MCP | 🟡 |
| 18 | Trancher les indisponibles | Michné Torah (256 €) en vitrine mais non vendable | Emmanuelle | 🟡 |
| 19 | Uniformiser la translittération | Michna/Mishna, Éliyahou/Eliyahou… | Admin/MCP | 🟡 |
| 20 | Champs promo (`prixBarre` + date de fin) | Pour les promos type « tous les Ragen à -20 % » | Code | 🟡 |
| 21 | ~~Fallback sections vides~~ | ✅ existait déjà (repli sur les plus récents) | — | — |
| 22 | Médias dupliqués (3 paires) | | Admin | 🟡 |
| 23 | Image du lot « Voix de l'Alliance » | `image: null` | Admin | 🟡 |
| 24 | Texte d'inscription newsletter | À rédiger | Emmanuelle/MCP | 🟡 |
| 25 | Titre du Magerman Prestige | Confusion avec le Maalot | Emmanuelle | 🟡 |
| 26 | Prix du coffret enfants | 4 × 10 € = 40 €, aucune remise — à confirmer | Emmanuelle | 🟡 |

## 5. Développement — Surveillance Dilicom/FEL (« killer feature »)

**Pourquoi** : un mauvais statut au FEL (« épuisé », « manquant ») rend le livre invisible ou
non commandable dans les logiciels de tous les libraires de France — des mois de ventes ont
déjà été perdus ainsi, sans que l'éditeur s'en aperçoive. Le site peut afficher « disponible »
pendant que le circuit pro dit le contraire.

**Cible** : contrôle quotidien (cron minuit existant) du statut FEL de chaque ISBN → statut +
date de contrôle affichés sur la fiche livre dans l'admin → **e-mail d'alerte** (SMTP en place)
dès qu'un statut se dégrade ou contredit le site (site : disponible / FEL : épuisé).

| # | Étape | Détail | Qui | Prio |
|---|---|---|---|---|
| 1 | Obtenir l'accès « FEL à la demande » | Web service Dilicom (GLN + clé) — demander au distributeur ou à Dilicom, en précisant « consultation FEL par web service ». Koren ne s'auto-distribue pas : la demande passe par le circuit du distributeur | Emmanuelle | 🔴 |
| 2 | Plomberie | Champs `felStatut`/`felDate` sur Livres (ajout non destructif), encart admin (à côté de la checklist), logique de comparaison site/FEL, e-mail d'alerte, source de données interchangeable | Code | 🟠 (faisable avant la clé) |
| 3 | Branchement du web service | Dès réception des identifiants — appel quotidien par ISBN, stockage, alertes actives | Code | 🔴 dès la clé reçue |
| 4 | (Option) prototype sur source publique | placedeslibraires.fr en attendant la clé — fragile, provisoire uniquement | Code | 🟡 |

## 6. Idées validées, reportées

- **Remise automatique libraires** : taux dans le global Réglages, appliqué au formulaire + PDF. Attend l'arbitrage du taux (unique ? par magasin ? dégressif ?).
- **Connecteur MCP sur iPhone** : en attente de la bêta « Request headers » de claude.ai sur le compte.
