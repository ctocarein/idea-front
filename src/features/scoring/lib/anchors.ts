import type { components } from "@/shared/api/schema";

type GridAxis = components["schemas"]["AxisOut"];
type Anchor = components["schemas"]["AnchorOut"];

/**
 * Lecture des ANCRES d'une dimension — où en est le porteur, et ce qu'il faut atteindre.
 *
 * « Viabilité : fragile » ne dit pas ce qui manque. « D6 Modèle économique 3/10 — aucun
 * prix ni coût unitaire identifié » le dit. Les ancres sont déjà écrites dans la grille
 * (`anchors[{min,max,label}]`) : les afficher n'est pas un développement de moteur, c'est
 * un affichage de champs existants.
 *
 * Module PUR : aucun réseau, aucun état. Le score n'est jamais recalculé ici — on situe
 * une valeur déjà produite dans des bandes déjà définies.
 */

/** Convention de la grille : borne haute EXCLUE, sauf pour la bande la plus haute. */
function contains(band: Anchor, value: number, topMax: number): boolean {
  if (value === topMax && band.max === topMax) return true;
  return value >= band.min && value < band.max;
}

/** Bandes triées, ou `[]` si la dimension n'en porte pas. */
function sortedBands(axis: GridAxis | undefined): Anchor[] {
  return [...(axis?.anchors ?? [])].sort((a, b) => a.min - b.min);
}

/** Ancre ATTEINTE par ce score. `null` si la grille n'a pas d'ancres pour cette dimension. */
export function reachedAnchor(axis: GridAxis | undefined, score: number | null): Anchor | null {
  if (score === null) return null;
  const bands = sortedBands(axis);
  if (bands.length === 0) return null;
  const topMax = bands[bands.length - 1].max;
  return bands.find((b) => contains(b, score, topMax)) ?? null;
}

/**
 * Ancre SUIVANTE — l'écart à combler, celui qui rend le bilan actionnable.
 *
 * `null` quand le porteur est déjà au palier le plus haut : il n'y a alors rien à viser,
 * et afficher un objectif vide serait pire que de ne rien afficher.
 */
export function nextAnchor(axis: GridAxis | undefined, score: number | null): Anchor | null {
  if (score === null) return null;
  const bands = sortedBands(axis);
  const reached = reachedAnchor(axis, score);
  if (!reached) return null;
  const index = bands.findIndex((b) => b.min === reached.min && b.max === reached.max);
  return index >= 0 && index < bands.length - 1 ? bands[index + 1] : null;
}

/** Indexe les axes de la grille par clé (`d1`…`d12`) pour un accès direct au rendu. */
export function axesByKey(axes: readonly GridAxis[] | undefined): Record<string, GridAxis> {
  return Object.fromEntries((axes ?? []).map((axis) => [axis.key, axis]));
}

/**
 * Le CTA d'une dimension est-il proposable ?
 *
 * Dix dimensions sur douze routent vers `academy` ou `pitchsim`, dont les modules sont
 * démontés. Tant que `SPEC_LEVIERS_V2` n'a pas re-routé ces leviers, seules `document` et
 * `mentor` portent un appel à l'action : les autres montrent l'écart au palier suivant,
 * sans bouton. Un objectif clair sans bouton vaut mieux qu'un bouton vers rien.
 */
export const ACTIONABLE_LEVERS = ["document", "mentor"] as const;

export function isActionableLever(leverType: string | undefined | null): boolean {
  return ACTIONABLE_LEVERS.includes(leverType as (typeof ACTIONABLE_LEVERS)[number]);
}
