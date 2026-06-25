/**
 * Données mockées du simulateur (design-first). Au Sprint INT : `app/llm` joue
 * l'investisseur (prompt versionné), sessions persistées (`practice_sessions`).
 */

/** Questions difficiles mais bienveillantes, posées dans l'ordre. */
export const INVESTOR_QUESTIONS: string[] = [
  "Quel problème résous-tu, et pour qui exactement ?",
  "Combien de personnes vivent ce problème — et comment le sais-tu ?",
  "Pourquoi toi ? Qu'as-tu que les autres n'ont pas ?",
  "Comment gagnes-tu de l'argent, concrètement ?",
  "Qu'est-ce qui pourrait tuer ce projet dans six mois ?",
];

export const INVESTOR_INTRO =
  "Bonjour. J'ai quelques minutes. Convainquez-moi — commençons simplement : présentez votre projet en une phrase.";

/** Historique de scores de pitch (avant/après) pour la progression. */
export const pitchHistory: { session: number; score: number }[] = [
  { session: 1, score: 42 },
  { session: 2, score: 55 },
  { session: 3, score: 61 },
  { session: 4, score: 70 },
];
