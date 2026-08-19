# Module Libraires — tout l'espace libraires en un seul endroit

Espace libraires de Koren France : tarif PDF vierge + bon de commande en ligne
(saisie → fiche Payload + PDF + e-mail). Fonctionne comme un « plugin » : toute la
logique vit ici, les routes Next sous `src/app/` ne sont que des stubs d'une ligne.

## Acheminement

```
/libraires (page)                    → PageLibraires.tsx
   ├─ « Télécharger le tarif (PDF) » → GET /bon-de-commande.pdf → api/tarif-pdf.ts
   │                                     └─ BonCommandePdf.tsx → renderTarifPdf()
   └─ BonCommandeForm.tsx (client)   → POST /api/bon-de-commande → api/creer-commande.ts
                                         ├─ recalcul serveur des prix (utilities/tarif.ts)
                                         ├─ payload.create('commandes')   ← Commandes.ts
                                         ├─ BonCommandePdf.tsx → renderCommandePdf()
                                         └─ after() : PDF joint à la fiche + e-mail SMTP
```

## Fichiers

| Fichier | Rôle |
|---|---|
| `PageLibraires.tsx` | Contenu de la page `/libraires` (en-tête + formulaire) |
| `BonCommandeForm.tsx` | Formulaire client : quantités, remise, coordonnées → POST |
| `BonCommandePdf.tsx` | Gabarits PDF (`@react-pdf/renderer`) : tarif vierge + bon rempli |
| `Commandes.ts` | Collection Payload `commandes` (bons validés, statut, PDF joint) |
| `api/tarif-pdf.ts` | Handler GET : tarif vierge généré à la volée depuis le catalogue |
| `api/creer-commande.ts` | Handler POST : validation, recalcul, fiche, PDF, e-mail |

## Stubs de routes (obligatoires côté Next, ne contiennent aucune logique)

- `src/app/(frontend)/libraires/page.tsx`
- `src/app/(frontend)/bon-de-commande.pdf/route.ts`
- `src/app/(frontend)/api/bon-de-commande/route.ts`

## Dépendances partagées (volontairement HORS du module)

- `src/utilities/tarif.ts` — aplatit un livre en lignes vendables avec `ref` stable ;
  **partagé avec le panier et les fiches produit**, ne pas le déplacer ici.
- `src/utilities/koren.ts` — `formatPrix` et libellés.
