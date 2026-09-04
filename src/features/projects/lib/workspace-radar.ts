import type { RadarScore } from "@/features/scoring";

/**
 * Le workspace renvoie `radar_score` en enveloppe libre (`Record<string, unknown>`),
 * là où le détail du bilan le renvoie typé. On le rétrécit ici plutôt que de caster
 * à l'aveugle : un score partiel (sans axes) vaut mieux nul qu'à moitié affiché.
 */
export function toWorkspaceRadar(raw: { [key: string]: unknown } | null | undefined): RadarScore | null {
  if (!raw) return null;
  const { gridVersion, axes } = raw as { gridVersion?: unknown; axes?: unknown };
  if (typeof gridVersion !== "string" || typeof axes !== "object" || axes === null) return null;
  // `overall` est SERVI par le backend (pondéré par secteur, /100) : le laisser tomber ici
  // obligerait l'écran à le réagréger, donc à afficher un autre nombre que le bilan.
  const { overall, pillars, sectorCalibrated } = raw as {
    overall?: unknown;
    pillars?: unknown;
    sectorCalibrated?: unknown;
  };
  return {
    gridVersion,
    axes: axes as RadarScore["axes"],
    overall: typeof overall === "number" ? overall : null,
    pillars: typeof pillars === "object" && pillars !== null ? (pillars as Record<string, number>) : null,
    sectorCalibrated: typeof sectorCalibrated === "boolean" ? sectorCalibrated : null,
  };
}
