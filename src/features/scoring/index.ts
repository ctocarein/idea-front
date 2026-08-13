/** Feature scoring — le Radar de Collision + tableau de compréhension. Barrel. */
// Types seuls : ce barrel est importé par des composants CLIENT, et `./api` touche
// `next/headers` (server-only). Les lectures s'importent via `@/features/scoring/api`.
export type { Grid, GridAxis, GridPillar, GridSummary } from "./api";
export { activateGrid, type ActivateGridResult } from "./actions";
export { GridVersions } from "./components/GridVersions";
export { RadarChart, type RadarChartProps } from "./components/RadarChart";
export {
  RadarScoreForm,
  type RadarScoreSubmission,
} from "./components/RadarScoreForm";
export { AnimatedRadarHero } from "./components/AnimatedRadarHero";
export { RadarHex } from "./components/RadarHex";
export { ComprehensionTable } from "./components/ComprehensionTable";
export {
  AXES,
  PILLARS,
  SCALE_MAX,
  MATURITY_LEVELS,
  TONE_TO_BADGE,
  LEVERS,
  pillarScore,
  overallScore,
  reading,
  maturityLevel,
  type AxisKey,
  type PillarKey,
  type ReadingTone,
  type RadarScore,
  type GridVersion,
  type MaturityLevel,
  type LeverType,
  type Lever,
} from "./types/scoring.types";
export {
  sampleScore,
  sampleScoreAfter,
  mockScoreFromInput,
} from "./lib/mock";
