/**
 * Feature flags produit.
 *
 * Le Simulateur de pitch et le Mentorat sont repoussés en V2 (marketplace
 * « Orbit »). On garde tout le code — on masque simplement les entrées de nav
 * et on garde les routes derrière un flag. Pour réactiver une feature :
 * passer le défaut à `true` OU définir la variable d'env correspondante.
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
} as const;

export type FeatureKey = keyof typeof features;
