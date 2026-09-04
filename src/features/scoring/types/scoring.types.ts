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

/**
 * Un score Radar = valeurs 0..SCALE_MAX par axe + version de grille.
 *
 * `overall` est SERVI par le backend, jamais recalculé ici : c'est une moyenne PONDÉRÉE
 * selon le secteur, sur 0..100. Le front n'a pas les poids, il ne peut donc pas la
 * reproduire — c'est précisément pourquoi les deux chiffres divergeaient.
 *
 * Optionnels : les bilans produits avant l'unification ne les portent pas.
 */
export interface RadarScore {
  gridVersion: GridVersion;
  axes: Record<AxisKey, number>;
  /** Score global pondéré 0..100, calculé et persisté par le backend. */
  overall?: number | null;
  /** Moyenne simple 0..SCALE_MAX par pilier — NE reconstitue PAS `overall`. */
  pillars?: Record<string, number> | null;
  /** Faux = aucune pondération calibrée pour ce secteur (toutes dimensions à poids égal). */
  sectorCalibrated?: boolean | null;
}

/** Moyenne (0..SCALE_MAX) des axes d'un pilier — vue porteur. */
export function pillarScore(score: RadarScore, pillar: PillarKey): number {
  const axes = AXES.filter((a) => a.pillar === pillar);
  const sum = axes.reduce((acc, a) => acc + (score.axes[a.key] ?? 0), 0);
  return Math.round(sum / axes.length);
}

/**
 * Moyenne NON PONDÉRÉE des 12 axes, ramenée sur 100.
 *
 * @deprecated Réservé aux FIXTURES (`lib/mock.ts`). Ne jamais l'utiliser sur une surface
 * d'affichage : le backend applique des poids par secteur que le front n'a pas, donc ce
 * nombre diffère de celui qui est persisté, servi par l'API et imprimé dans le bilan
 * téléchargé. C'est l'écart que l'unification du score a fermé — il ne doit pas rouvrir.
 *
 * Un score réel porte `overall` : lisez-le, ne le recalculez pas.
 */
export function overallScore(score: RadarScore): number {
  const sum = AXES.reduce((acc, a) => acc + (score.axes[a.key] ?? 0), 0);
  return Math.round((sum / AXES.length) * (100 / SCALE_MAX));
}

export type ReadingTone = "strong" | "good" | "watch" | "fragile";

/** Lecture qualitative non culpabilisante (charte §1.6) — sur 100. Utilisée pour les piliers. */
export function reading(value: number): { label: string; tone: ReadingTone } {
  if (value >= 75) return { label: "Solide", tone: "strong" };
  if (value >= 55) return { label: "En bonne voie", tone: "good" };
  if (value >= 35) return { label: "À renforcer", tone: "watch" };
  return { label: "À explorer", tone: "fragile" };
}

/** Niveau de maturité global — 6 paliers du score /100 (PRESENTATION.md §8). */
export interface MaturityLevel {
  key: string;
  label: string;
  min: number;
  max: number;
  description: string;
  tone: ReadingTone;
}

/**
 * Paliers de maturité — SERVIS par le backend (`GET /scoring/grid` → `maturity_levels`).
 *
 * Ils étaient définis deux fois, ici et dans `app/scoring/constants.py`. Les bornes
 * coïncidaient, mais rien ne le garantissait : un changement backend ne cassait aucun test
 * front. Une seule définition subsiste désormais, et c'est celle qui a servi à calculer.
 */

/**
 * Palier correspondant au score global /100, dans les bornes FOURNIES par le backend.
 *
 * `levels` est requis : sans lui, il faudrait un tableau de repli — c'est-à-dire une
 * seconde définition, et le doublon qu'on vient de supprimer. Rend `null` si les paliers
 * ne sont pas encore chargés, ce que l'appelant doit afficher comme « — ».
 */
export function maturityLevel(
  overall: number,
  levels: readonly MaturityLevel[],
): MaturityLevel | null {
  return levels.find((l) => overall >= l.min && overall <= l.max) ?? null;
}

/** Mapping tone → variante de Badge (shadcn). */
export const TONE_TO_BADGE: Record<ReadingTone, "success" | "warning" | "primary" | "neutral"> = {
  strong: "success",
  good: "primary",
  watch: "warning",
  fragile: "neutral",
};

/** Type de levier : où pointer le porteur pour renforcer une dimension. */
export type LeverType = "academy" | "pitchsim" | "document" | "mentor";

export interface Lever {
  type: LeverType;
  topic: string;
}

/**
 * Map dimension → levier d'action (miroir de `_LEVERS` backend dans `app/scoring/constants.py`).
 * Utilisé pour transformer un axe faible en lien ciblé (Academy, pitch sim, mentors, documents).
 */
export const LEVERS: Record<AxisKey, Lever> = {
  d1:  { type: "academy",  topic: "probleme" },
  d2:  { type: "academy",  topic: "solution" },
  d3:  { type: "pitchsim", topic: "proposition_valeur" },
  d4:  { type: "academy",  topic: "marche" },
  d5:  { type: "academy",  topic: "concurrence" },
  d6:  { type: "academy",  topic: "modele_economique" },
  d7:  { type: "document", topic: "preuves_traction" },
  d8:  { type: "academy",  topic: "croissance" },
  d9:  { type: "academy",  topic: "go_to_market" },
  d10: { type: "mentor",   topic: "equipe" },
  d11: { type: "academy",  topic: "avancement" },
  d12: { type: "academy",  topic: "risques" },
};
