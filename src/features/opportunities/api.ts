import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

/**
 * Opportunités B2B (Sprint INT). Scopées au projet du porteur : le backend calcule
 * l'éligibilité (`eligible` + `missing`) à partir du score/maturité du projet.
 */
export type Opportunity = components["schemas"]["OpportunityOut"];

export async function getOpportunities(projectId: string): Promise<Opportunity[]> {
  return apiFetch<Opportunity[]>(
    `/api/v1/opportunities?project_id=${encodeURIComponent(projectId)}`,
  );
}
