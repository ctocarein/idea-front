import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";
import { toMaturityLevels } from "./lib/maturity";
import type { MaturityLevel } from "./types/scoring.types";

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

/**
 * Paliers de maturité de la grille active — SOURCE UNIQUE du système.
 *
 * Raccourci pour les écrans qui n'ont besoin QUE des paliers. Une page qui veut aussi les
 * ancres charge la grille une seule fois et passe par `toMaturityLevels` : deux requêtes
 * pourraient servir deux versions de grille, et un bilan mélangeant les ancres de l'une et
 * les paliers de l'autre serait faux sans que rien ne le signale.
 */
export async function getMaturityLevels(): Promise<MaturityLevel[]> {
  return toMaturityLevels(await getActiveGrid());
}
