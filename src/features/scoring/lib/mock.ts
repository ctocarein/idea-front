import { AXES, SCALE_MAX, type RadarScore } from "../types/scoring.types";

/**
 * Scores mockés (vitrines/démo). Le vrai score vient du backend (`GET /reports/{id}`
 * → `radar_score`, grille v2 /10). Déterministe pour éviter tout mismatch d'hydratation.
 */

/** Score d'exemple « équilibré » (valeurs /10). */
export const sampleScore: RadarScore = {
  gridVersion: "mock-v2",
  axes: {
    d1: 8,
    d2: 7,
    d3: 6,
    d4: 5,
    d5: 4,
    d6: 4,
    d7: 5,
    d8: 6,
    d9: 5,
    d10: 7,
    d11: 6,
    d12: 5,
  },
};

/** Exemple « après » (progression) pour démontrer l'avant/après. */
export const sampleScoreAfter: RadarScore = {
  gridVersion: "mock-v2",
  axes: {
    d1: 9,
    d2: 8,
    d3: 8,
    d4: 7,
    d5: 6,
    d6: 6,
    d7: 7,
    d8: 8,
    d9: 7,
    d10: 8,
    d11: 8,
    d12: 7,
  },
};

/** Hash simple et stable d'une chaîne → entier positif. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Génère un score pseudo-réaliste à partir d'une saisie (catégorie + idée).
 * Déterministe : la même saisie donne toujours le même bilan. Valeurs 3..SCALE_MAX.
 */
export function mockScoreFromInput(seed: string): RadarScore {
  const base = hash(seed);
  const axes = {} as RadarScore["axes"];
  AXES.forEach((axis, i) => {
    axes[axis.key] = ((base >> (i * 2)) % (SCALE_MAX - 2)) + 3; // 3..SCALE_MAX
  });
  return { gridVersion: "mock-v2", axes };
}
