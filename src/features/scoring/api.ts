import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";
import type { MaturityLevel, ReadingTone } from "./types/scoring.types";

/**
 * Grille Radar servie par le backend — la référence d'évaluation, versionnée.
 *
 * `GET /scoring/grid` renvoie la grille **active** (lecture ouverte : la grille est une
 * donnée de référence non sensible). `GET /admin/scoring/grids` liste les versions
 * connues, pour la gouvernance (cf. `./actions` pour l'activation).
 *
 * Les constantes `AXES`/`PILLARS` de `types/scoring.types` restent le miroir statique
 * utilisé par les écrans porteur (rendu synchrone, hors réseau) ; cette API est la
 * source de vérité quand il s'agit de dire *ce que le backend applique réellement*.
 */
export type Grid = components["schemas"]["GridOut"];
export type GridAxis = components["schemas"]["AxisOut"];
export type GridPillar = components["schemas"]["PillarOut"];
export type GridSummary = components["schemas"]["GridSummaryOut"];

export async function getActiveGrid(): Promise<Grid> {
  return apiFetch<Grid>("/api/v1/scoring/grid");
}

export async function getGridVersions(): Promise<GridSummary[]> {
  return apiFetch<GridSummary[]>("/api/v1/admin/scoring/grids");
}

const TONES: readonly ReadingTone[] = ["strong", "good", "watch", "fragile"];

/**
 * Paliers de maturité de la grille active — SOURCE UNIQUE du système.
 *
 * Le front les recopiait en dur ; les bornes coïncidaient, mais rien ne le garantissait —
 * un changement backend ne cassait aucun test ici. On rétrécit le `tone` (l'OpenAPI le
 * décrit comme `string`) plutôt que de caster à chaque appel.
 */
export async function getMaturityLevels(): Promise<MaturityLevel[]> {
  const grid = await getActiveGrid();
  return (grid.maturity_levels ?? []).map((level) => ({
    ...level,
    tone: TONES.includes(level.tone as ReadingTone) ? (level.tone as ReadingTone) : "watch",
  }));
}
