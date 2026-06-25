# Migration front — scoring v1 → v2 (12 dimensions / 4 piliers, /10)

**À exécuter quand : (1) la grille v2 est figée en atelier, (2) les types sont régénérés depuis
l'OpenAPI backend.** Réf. `GRILLE_RADAR_V2.md`, `RAPPORT_PREDIAGNOSTIC.md`.

> Principe front inchangé : les types viennent de l'OpenAPI. Ce doc liste l'impact UI à reprendre
> à la main (rendu, géométrie), que la régénération de types ne fait pas.

## Changements de fond
| v1 | v2 |
| :--- | :--- |
| 6 axes | **12 dimensions** (D1-D12) |
| 3 lentilles (essence/viabilité/scalabilité) | **4 piliers** (SENS/VIABILITÉ/SCALABILITÉ/EXÉCUTION) |
| /100 | **/10** (1 décimale pour agrégats) |
| `RadarScore { gridVersion, axes }` | idem, mais 12 clés `d1…d12`, valeurs 0-10 |

## Fichiers à reprendre (par ordre)
1. **`features/scoring/types/scoring.types.ts`** — régénéré/aligné : `PILLARS` (4), `DIMENSIONS` (12, `code`, `label`, `pillar`, `centralQuestion`), `RadarScore` (12 clés /10), `reading()` sur /10 (Faible 0-4 · Moyen 5-7 · Fort 8-10), `pillarScore()`/`overall()`.
2. **`features/scoring/components/RadarChart.tsx`** — ⚠️ **géométrie** : hexagone 6 points → **polygone 12 points** (angles `i * 30°`), libellés des 12 dimensions, grille radiale graduée /10.
3. **`features/scoring/components/ComprehensionTable.tsx`** — `grid-cols-3` → **`grid-cols-2` (4 piliers, 2×2)**, `/100` → `/10`, largeur barre `value*10%`, 3 dimensions par pilier.
4. **`features/scoring/components/RadarHex.tsx`** — ornement : adapter si lié à 6 sommets.
5. **`features/scoring/lib/mock.ts`** — mocks de score sur 12 clés /10.
6. **`features/scoring/types/scoring.test.ts`** — valeurs attendues sur la grille v2.
7. **`features/projects/types/project.types.ts`** — `RadarScore` (type) : OK via régénération ; vérifier les mocks `projects/data/mock.ts`.
8. **Consommateurs** (rendu seulement, pas de logique) : `diagnostics/DiagnosticResult`, `pitch-simulator/PitchFeedbackPanel`, `instrumentation` — relire les libellés « 6 axes » → « 12 dimensions ».

## Nouveau : le rapport de pré-diagnostic
Le bilan devient un **rapport 3 pages** (`RAPPORT_PREDIAGNOSTIC.md`) : prévoir côté `reports`/`dashboard`
le rendu du **résumé**, **verdict** (statut), **matrice de risques**, **table concurrents**, **métriques
d'avancement**, **recommandations priorisées**, **next steps**. Couleurs **charte « Aube »** (pas le navy/ambre
de la maquette source).

## Garde-fous
- Ne pas hardcoder « 6 » ni « /100 » : tout dérive de `PILLARS`/`DIMENSIONS`/`scaleMax`.
- Radar 12 points : vérifier lisibilité mobile (labels courts, ou légende déportée).
- Tests Vitest verts + build `pnpm build` avant merge.
