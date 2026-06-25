/** Feature scoring — le Radar de Collision + tableau de compréhension. Barrel. */
export { RadarChart, type RadarChartProps } from "./components/RadarChart";
export { RadarHex } from "./components/RadarHex";
export { ComprehensionTable } from "./components/ComprehensionTable";
export {
  AXES,
  PILLARS,
  SCALE_MAX,
  pillarScore,
  overallScore,
  reading,
  type AxisKey,
  type PillarKey,
  type ReadingTone,
  type RadarScore,
  type GridVersion,
} from "./types/scoring.types";
export {
  sampleScore,
  sampleScoreAfter,
  mockScoreFromInput,
} from "./lib/mock";
