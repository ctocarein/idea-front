import type { components } from "@/shared/api/schema";
import type { MaturityLevel, ReadingTone } from "../types/scoring.types";

type Grid = components["schemas"]["GridOut"];

const TONES: readonly ReadingTone[] = ["strong", "good", "watch", "fragile"];

/**
 * Paliers de maturité d'une grille servie — SOURCE UNIQUE du système.
 *
 * Le front les recopiait en dur ; les bornes coïncidaient, mais rien ne le garantissait.
 * Adaptateur PUR : la page charge la grille UNE fois et en tire à la fois les paliers et
 * les ancres. Deux requêtes séparées pourraient servir deux versions différentes — et un
 * bilan lu avec les ancres d'une grille et les paliers d'une autre serait faux sans que
 * rien ne le signale.
 *
 * Rétrécit `tone`, que l'OpenAPI décrit comme `string`.
 */
export function toMaturityLevels(grid: Grid | null | undefined): MaturityLevel[] {
  return (grid?.maturity_levels ?? []).map((level) => ({
    ...level,
    tone: TONES.includes(level.tone as ReadingTone) ? (level.tone as ReadingTone) : "watch",
  }));
}
