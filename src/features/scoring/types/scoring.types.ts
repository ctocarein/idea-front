/**
 * Grille Radar — MIROIR CLIENT v2 (ARCHITECTURE_FRONTEND.md §10bis.1).
 *
 * 12 dimensions D1-D12 réparties en 4 piliers, notées sur 10 (SENS, VIABILITÉ, SCALABILITÉ, EXÉCUTION).
 * Source de vérité : backend `GET /scoring/grid` (`scoring_grids` versionné, ici `v2-placeholder`).
 * `RadarScore` est structurellement identique au backend (`{gridVersion, axes: Record<string,int>}`) ;
 * ce fichier fige les clés/libellés/piliers du miroir client (cf. `docs/GRILLE_RADAR_V2.md`).
 *
 * Deux niveaux de lecture, un seul moteur :
 *  - porteur → ComprehensionTable (piliers, pédagogique, non culpabilisant)
 *  - expert  → RadarChart (12 axes bruts)
 */

/** Échelle des dimensions (0..SCALE_MAX), alignée sur `scale_max` du backend. */
export const SCALE_MAX = 10;

export const PILLARS = [
  {
    key: "sens",
    label: "Sens du projet",
    question: "Répond-il à un vrai problème avec une solution pertinente ?",
  },
  { key: "viabilite", label: "Viabilité", question: "Peut-il tenir économiquement ?" },
  { key: "scalabilite", label: "Scalabilité", question: "Peut-il grandir sans se casser ?" },
  { key: "execution", label: "Exécution", question: "L'équipe peut-elle exécuter et livrer ?" },
] as const;

export type PillarKey = (typeof PILLARS)[number]["key"];

export const AXES = [
  { key: "d1", code: "D1", label: "Problème", short: "Problème", pillar: "sens" },
  { key: "d2", code: "D2", label: "Solution", short: "Solution", pillar: "sens" },
  { key: "d3", code: "D3", label: "Proposition de valeur", short: "Valeur", pillar: "sens" },
  { key: "d4", code: "D4", label: "Marché", short: "Marché", pillar: "viabilite" },
  { key: "d5", code: "D5", label: "Concurrence & Benchmark", short: "Concurrence", pillar: "viabilite" },
  { key: "d6", code: "D6", label: "Modèle économique", short: "Modèle éco", pillar: "viabilite" },
  { key: "d7", code: "D7", label: "Traction & Preuves", short: "Traction", pillar: "scalabilite" },
  { key: "d8", code: "D8", label: "Potentiel de croissance", short: "Croissance", pillar: "scalabilite" },
  { key: "d9", code: "D9", label: "Stratégie Go-to-Market", short: "Go-to-market", pillar: "scalabilite" },
  { key: "d10", code: "D10", label: "Équipe & Compétences", short: "Équipe", pillar: "execution" },
  { key: "d11", code: "D11", label: "Niveau d'avancement", short: "Avancement", pillar: "execution" },
  { key: "d12", code: "D12", label: "Risques & Freins", short: "Risques", pillar: "execution" },
] as const satisfies ReadonlyArray<{
  key: string;
  code: string;
  label: string;
  short: string;
  pillar: PillarKey;
}>;

export type AxisKey = (typeof AXES)[number]["key"];

export type GridVersion = string;

/** Un score Radar = valeurs 0..SCALE_MAX par axe + version de grille. */
export interface RadarScore {
  gridVersion: GridVersion;
  axes: Record<AxisKey, number>;
}

/** Moyenne (0..SCALE_MAX) des axes d'un pilier — vue porteur. */
export function pillarScore(score: RadarScore, pillar: PillarKey): number {
  const axes = AXES.filter((a) => a.pillar === pillar);
  const sum = axes.reduce((acc, a) => acc + (score.axes[a.key] ?? 0), 0);
  return Math.round(sum / axes.length);
}

/** Score global **sur 100** (moyenne des 12 axes ramenée /100) — pour la boussole + `reading`. */
export function overallScore(score: RadarScore): number {
  const sum = AXES.reduce((acc, a) => acc + (score.axes[a.key] ?? 0), 0);
  return Math.round((sum / AXES.length) * (100 / SCALE_MAX));
}

export type ReadingTone = "strong" | "good" | "watch" | "fragile";

/** Lecture qualitative non culpabilisante (charte §1.6) — sur 100. */
export function reading(value: number): { label: string; tone: ReadingTone } {
  if (value >= 75) return { label: "Solide", tone: "strong" };
  if (value >= 55) return { label: "En bonne voie", tone: "good" };
  if (value >= 35) return { label: "À renforcer", tone: "watch" };
  return { label: "À explorer", tone: "fragile" };
}
