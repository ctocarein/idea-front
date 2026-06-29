import { apiFetch } from "@/shared/api/client";

export interface OpportunityAdminOut {
  id: string;
  title: string;
  kind: string;
  description: string;
  sector: string | null;
  min_overall: number;
  min_maturity: number | null;
  deadline: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getAdminOpportunities(): Promise<OpportunityAdminOut[]> {
  return apiFetch<OpportunityAdminOut[]>("/api/v1/admin/opportunities");
}
