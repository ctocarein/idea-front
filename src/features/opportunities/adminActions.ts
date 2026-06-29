"use server";

import { apiFetch } from "@/shared/api/client";
import type { OpportunityAdminOut } from "./adminApi";

export interface OpportunityFormData {
  title: string;
  kind: string;
  description: string;
  sector: string;
  min_overall: number;
  min_maturity: number | null;
  deadline: string | null;
  is_active: boolean;
}

export type OppResult =
  | { ok: true; data: OpportunityAdminOut }
  | { ok: false; message: string };

export async function createOpportunity(body: OpportunityFormData): Promise<OppResult> {
  try {
    const data = await apiFetch<OpportunityAdminOut>("/api/v1/admin/opportunities", {
      method: "POST",
      json: {
        ...body,
        sector: body.sector || null,
        min_maturity: body.min_maturity ?? null,
        deadline: body.deadline || null,
      },
    });
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Erreur lors de la création. Réessaie." };
  }
}

export async function updateOpportunity(id: string, body: OpportunityFormData): Promise<OppResult> {
  try {
    const data = await apiFetch<OpportunityAdminOut>(`/api/v1/admin/opportunities/${id}`, {
      method: "PUT",
      json: {
        ...body,
        sector: body.sector || null,
        min_maturity: body.min_maturity ?? null,
        deadline: body.deadline || null,
      },
    });
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Erreur lors de la mise à jour. Réessaie." };
  }
}

export async function setOpportunityActive(id: string, active: boolean): Promise<OppResult> {
  try {
    const data = await apiFetch<OpportunityAdminOut>(`/api/v1/admin/opportunities/${id}/active`, {
      method: "PATCH",
      json: { active },
    });
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Impossible de changer l'état. Réessaie." };
  }
}
