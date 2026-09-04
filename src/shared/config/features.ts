/**
 * Feature flags produit.
 *
 * Le Simulateur de pitch et le Mentorat sont repoussés en V2 (marketplace
 * « Orbit »). On garde tout le code — on masque simplement les entrées de nav
 * et on garde les routes derrière un flag. Pour réactiver une feature :
 * passer le défaut à `true` OU définir la variable d'env correspondante.
 *
 * VISION v3.1 « Le Miroir » §3 — le Studio et l'éditeur de pitch sortent du chemin
 * critique : marque et deck sont l'AVAL du parcours, hors du seul moment validé
 * (diagnostic → bilan explicable → ce qui manque). Aucune réaction utilisateur ne les
 * a jamais concernés. Méthode de retrait explicitement prescrite : flag côté front,
 * router non monté côté back, **aucune suppression de code**. On arrête de payer le
 * coût cognitif et la surface de panne ; on ne perd pas le travail.
 */

function flag(envValue: string | undefined, fallback: boolean): boolean {
  if (envValue === undefined || envValue === "") return fallback;
  return envValue === "true" || envValue === "1";
}

export const features = {
  /** Simulateur de pitch (comité silencieux) — V2. */
  pitchSimulator: flag(process.env.NEXT_PUBLIC_FEATURE_PITCH_SIM, false),
  /** Mentorat (marketplace mentors) — V2. */
  mentors: flag(process.env.NEXT_PUBLIC_FEATURE_MENTORS, false),
  /** Studio de marque (logo, kit) — hors chemin critique, v3.1 §3. */
  studio: flag(process.env.NEXT_PUBLIC_FEATURE_STUDIO, false),
  /** Éditeur de pitch & deck — hors chemin critique, v3.1 §3. */
  pitchEditor: flag(process.env.NEXT_PUBLIC_FEATURE_PITCH_EDITOR, false),
} as const;

export type FeatureKey = keyof typeof features;
