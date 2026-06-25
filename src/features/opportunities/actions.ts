"use server";

import { ApiError, apiFetch } from "@/shared/api/client";

export type InterestResult = { ok: true } | { ok: false; message: string };

/** Manifester l'intérêt du porteur pour une opportunité (B2B). */
export async function expressInterest(
  opportunityId: string,
  projectId: string,
): Promise<InterestResult> {
  try {
    await apiFetch(`/api/v1/opportunities/${opportunityId}/interest`, {
      method: "POST",
      json: { project_id: projectId },
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { ok: false, message: "Tu as déjà manifesté ton intérêt." };
    }
    return { ok: false, message: "Action impossible pour l'instant. Réessaie." };
  }
}
