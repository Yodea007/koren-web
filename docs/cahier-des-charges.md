# Cahier des charges — Site Koren France

> Remplace https://www.korenfrance.com/ (Shopify, jugé lourd et coûteux).
> Statut : **brouillon** — les points marqués ⚠️ restent à trancher.

## 1. Contexte & objectifs

Koren France est un éditeur de livres (textes du judaïsme : Bibles, livres de prière,
Talmud, Paracha, philosophie, jeunesse — et romans).

Objectifs du nouveau site :
1. **Mettre en avant les nouveautés et le catalogue** (cœur du site)
2. Vente en ligne fluide (paiement Stripe)
3. Site rapide, moderne (« faire 2026 »), **mobile d'abord**
4. Sortir de Shopify : maîtrise totale, hébergement perso à terme, pas d'abonnement

## 2. Cibles

| Cible | Parcours |
|---|---|
| **Particuliers** | Achat invité, sans compte. Paiement CB / Apple Pay / Google Pay via Stripe. |
| **Libraires (B2B)** | Compte validé manuellement par Koren. Remises dédiées, historique de commandes, bons de commande enregistrés, **paiement à 3 mois** (sur facture, pas par carte) après validation. |

## 3. Périmètre fonctionnel

### Vitrine
- **Accueil** : nouveautés en avant, sélections, accès direct au catalogue
- **Catalogue** : liste filtrable, recherche
- **Fiche livre** : couverture, description, extrait (PDF feuilletable ?⚠️), prix, auteur, caractéristiques (format, pages, ISBN)
- Pages : à propos de Koren, contact, CGV, mentions légales
- Actualités / événements ⚠️ (existe sur le site actuel — à garder ?)

### Catégorisation — à repenser (le rangement actuel est jugé « bof »)
Piste : remplacer l'arbre unique Shopify par des **facettes croisables** :
- *Type d'ouvrage* : Bible, prière, Talmud, commentaire, roman, jeunesse, beau livre…
- *Occasion / fête* : Chabbat, Pessah, Kippour, mariage, bar-mitsva…
- *Public* : enfant, adolescent, adulte, débutant / étudiant
⚠️ À valider ensemble avec le catalogue sous les yeux.

### E-commerce B2C
- Panier, livraison France + international à tarifs fixés ⚠️ (grille à fournir)
- Stripe Checkout (CB, Apple Pay, Google Pay) — pas de stockage de carte chez nous
- Emails transactionnels : confirmation, expédition
- FR / EUR uniquement

### Espace libraire B2B
- Demande de compte → validation manuelle dans l'admin Payload
- Remise appliquée automatiquement ⚠️ (taux unique pour tous les libraires, ou taux par libraire ?)
- Commande sans paiement immédiat : génère un **bon de commande / facture à 3 mois**
- Historique des commandes, bons enregistrés (re-commande rapide)
- ⚠️ Qui valide chaque commande à 3 mois — automatique ou validation manuelle par Koren ?

### Administration (back-office Payload)
- Gestion du catalogue (livres, catégories, nouveautés, mises en avant accueil)
- Gestion des commandes (statuts : payée / à expédier / expédiée / facture à 3 mois en cours)
- Gestion des comptes libraires (validation, remise)
- Gestion du stock ⚠️ (suivi des quantités nécessaire, ou simple « disponible / épuisé » ?)

## 4. Design
- Sobre, littéraire, beaucoup de blanc — les **couvertures sont le visuel principal**
- Mobile d'abord : consultation et achat au pouce, navigation simple
- Performance : pages quasi instantanées (avantage net vs Shopify actuel)
- Direction artistique à explorer ⚠️ (maquettes — voir avec Claude Desktop)

## 5. Contenu & reprise de données
- Source principale : **catalogue PDF à jour** fourni par Koren → extraction des fiches
- Complément : visuels / descriptions récupérés sur Shopify si meilleurs
- Modèle de données : Livre, Auteur, Catégories/facettes, Commande, Compte libraire

## 6. Socle technique (existant)
- Payload CMS 3 + Next.js 16, PostgreSQL — déjà installé et fonctionnel
- Stripe pour les paiements ; emails transactionnels ⚠️ (service à choisir, ex. Resend)
- Données persistantes centralisées dans `editeur-livres/` (cf. CLAUDE.md)
- Hébergement : local aujourd'hui, serveur perso à terme (Docker prêt)

## 7. Hors périmètre (pour l'instant)
- Multi-devises, multilingue
- Comptes clients particuliers (achat invité seulement)
- Livre numérique / téléchargements

## 8. Phasage proposé
1. **Catalogue vitrine** : modèle de données, import du catalogue, accueil + fiches + recherche — le site remplace déjà Shopify en consultation
2. **Vente B2C** : panier + Stripe + livraison + emails
3. **Espace libraire B2B** : comptes, remises, paiement à 3 mois
4. Bascule : domaine korenfrance.com → nouveau site, fermeture Shopify
