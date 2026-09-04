/**
 * Reprise d'une saisie interrompue — logique PURE, sans React ni réseau.
 *
 * Extraite du wizard parce qu'elle porte les deux décisions qui peuvent faire perdre du
 * travail à un porteur : où le remettre, et quel texte l'emporte quand deux versions
 * existent. Une régression ici est invisible à l'œil et coûteuse à l'usage.
 */

/**
 * Position de reprise dans le wizard.
 *
 * Retombe sur 0 si la dimension est inconnue : la grille peut avoir changé entre l'abandon
 * et la reprise, et mieux vaut recommencer au début que planter sur un index disparu.
 */
export function resumeIndex(
  dimensionKeys: readonly string[],
  lastDimension: string | null | undefined,
): number {
  if (!lastDimension) return 0;
  const index = dimensionKeys.indexOf(lastDimension);
  return index >= 0 ? index : 0;
}

/**
 * Fusion des textes : ce que l'IA a rédigé, PUIS ce que le porteur a écrit.
 *
 * L'ordre est le point sensible. Inversé, reprendre son brouillon écraserait son propre
 * travail par la proposition initiale — le porteur perdrait exactement ce que la reprise
 * était censée sauver.
 */
export function mergeDrafts(
  aiDrafts: Record<string, string>,
  ownerDrafts: Record<string, string> | null | undefined,
): Record<string, string> {
  return { ...aiDrafts, ...(ownerDrafts ?? {}) };
}

/** Nombre de dimensions réellement renseignées — ce qu'annonce le bandeau de reprise. */
export function filledCount(answers: Record<string, string> | null | undefined): number {
  return Object.values(answers ?? {}).filter((value) => value.trim().length > 0).length;
}
