/** Feature scoring — le Radar de Collision + tableau de compréhension. Barrel. */
export { RadarChart, type RadarChartProps } from "./components/RadarChart";
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
