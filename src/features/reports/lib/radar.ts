import type { components } from "@/shared/api/schema";
import type { RadarScore } from "@/features/scoring";

type ReportDetailOut = components["schemas"]["ReportDetailOut"];

/**
 * Adapte le `radar_score` backend (clés d1-d12 /10) au type front. Les clés correspondent déjà.
 *
 * Module PUR, séparé de `../api` : cet adaptateur est utilisé aussi par des composants
 * client, or `api.ts` passe par le client HTTP server-only (`next/headers`).
 */
export function toRadarScore(radar: NonNullable<ReportDetailOut["radar_score"]>): RadarScore {
  return { gridVersion: radar.gridVersion, axes: radar.axes as RadarScore["axes"] };
}
