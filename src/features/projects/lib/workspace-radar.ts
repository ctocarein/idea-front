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
  return { gridVersion, axes: axes as RadarScore["axes"] };
}
