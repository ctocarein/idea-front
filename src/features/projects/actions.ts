"use server";

import { ApiError, apiFetch } from "@/shared/api/client";
import type { ProjectStatus } from "./types/project.types";

export type AdminActionResult = { ok: true } | { ok: false; message: string };

/** Faire avancer le statut de revue d'un projet (machine de curation). */
export async function transitionReview(
  projectId: string,
  target: ProjectStatus,
): Promise<AdminActionResult> {
  try {
    await apiFetch(`/api/v1/admin/projects/${projectId}/review-status`, {
      method: "PATCH",
      json: { target },
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { ok: false, message: "Transition non autorisée depuis ce statut." };
    }
    return { ok: false, message: "Action impossible pour l'instant. Réessaie." };
  }
}

/** Assigner / désassigner un analyste (UUID ou null). */
export async function setAssignee(
  projectId: string,
  assigneeId: string | null,
): Promise<AdminActionResult> {
  try {
    await apiFetch(`/api/v1/admin/projects/${projectId}/assignee`, {
      method: "PATCH",
      json: { assignee_id: assigneeId },
    });
    return { ok: true };
  } catch {
    return { ok: false, message: "Action impossible pour l'instant. Réessaie." };
  }
}
