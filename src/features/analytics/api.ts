import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

/**
 * Tableau de bord d'apprentissage (admin, Sprint 6) — le freemium « apprenant ».
 * Funnel de transformation bilan_viewed → action_started → opportunity_interest.
 * `GET /admin/learning-dashboard`.
 */
export type LearningDashboard = components["schemas"]["LearningDashboardOut"];

export async function getLearningDashboard(): Promise<LearningDashboard> {
  return apiFetch<LearningDashboard>("/api/v1/admin/learning-dashboard");
}
