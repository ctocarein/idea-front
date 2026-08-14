import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

/**
 * Radar explicable (mémoire projet) — `GET /projects/{id}/evaluation`.
 *
 * Les types viennent de l'OpenAPI (`schema.d.ts`), à une exception près : le backend
 * sérialise les contradictions en dictionnaire libre (`list[dict[str, str]]`), ce qui
 * effacerait leurs clés à la lecture. On garde donc `Contradiction` en refinement local,
 * fidèle à ce que produit réellement le détecteur (`app/project_memory/evaluation.py`).
 */
export type EvidenceState = components["schemas"]["EvidenceState"];

/** Un constat d'incohérence rattaché à une dimension (produit par le détecteur). */
export interface Contradiction {
  id: string;
  statement: string;
  quote_a?: string;
  quote_b?: string;
  inconsistency_type?: string;
  severity?: string;
}

export type DimensionEvaluation = Omit<
  components["schemas"]["DimensionEvaluationOut"],
  "contradictions"
> & {
  /** Peuplé par le détecteur (flux diagnostic guidé). */
  contradictions?: Contradiction[];
};

export type AdaptiveQuestion = components["schemas"]["AdaptiveQuestionOut"];

export type ProjectEvaluation = Omit<
  components["schemas"]["ProjectEvaluationOut"],
  "dimensions"
> & {
  dimensions: DimensionEvaluation[];
};

export async function getProjectEvaluation(projectId: string): Promise<ProjectEvaluation> {
  return apiFetch<ProjectEvaluation>(`/api/v1/projects/${projectId}/evaluation`);
}
