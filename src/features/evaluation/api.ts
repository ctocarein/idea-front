import { apiFetch } from "@/shared/api/client";

/**
 * Radar explicable (mémoire projet) — `GET /projects/{id}/evaluation`.
 *
 * NB : ces types sont écrits à la main car l'endpoint fait partie de la branche
 * backend `audit-incoherences` et n'est pas encore dans l'OpenAPI généré
 * (`schema.d.ts`). À remplacer par `components["schemas"]["ProjectEvaluationOut"]`
 * une fois le schéma régénéré. Miroir de `app/project_memory/evaluation_schemas.py`.
 */
export type EvidenceState =
  | "unknown"
  | "inferred"
  | "declared"
  | "supported"
  | "verified"
  | "stale";

/** Un constat d'incohérence rattaché à une dimension (produit par le détecteur). */
export interface Contradiction {
  id: string;
  statement: string;
  quote_a?: string;
  quote_b?: string;
  inconsistency_type?: string;
  severity?: string;
}

export interface DimensionEvaluation {
  dimension: string;
  code: string;
  label: string;
  pillar: string;
  score: number | null;
  confidence: number; // 0..1
  evidence_state: EvidenceState;
  rationale: string;
  contradictions: Contradiction[]; // peuplé par le détecteur (flux diagnostic guidé)
  missing_information: string;
  next_action: Record<string, unknown>;
  score_run_id: string | null;
  evaluated_at: string | null;
}

export interface AdaptiveQuestion {
  dimension: string;
  code: string;
  label: string;
  question: string;
  reason: string;
  priority: number;
}

export interface ProjectEvaluation {
  project_id: string;
  grid_version: string | null;
  dimensions: DimensionEvaluation[];
  questions: AdaptiveQuestion[];
}

export async function getProjectEvaluation(projectId: string): Promise<ProjectEvaluation> {
  return apiFetch<ProjectEvaluation>(`/api/v1/projects/${projectId}/evaluation`);
}
