"use server";

import { ApiError, apiErrorMessage, apiFetch } from "@/shared/api/client";
import type { ProjectMemoryItem } from "./api";
import type { ProjectStatus } from "./types/project.types";

export type AdminActionResult = { ok: true } | { ok: false; message: string };

export type AddMemoryResult =
  | { ok: true; item: ProjectMemoryItem }
  | { ok: false; message: string };

/**
 * Le porteur apporte une précision sur une dimension — `POST /projects/{id}/memory`.
 *
 * C'est le geste qui fait bouger l'`evidence_state` du radar explicable : une dimension
 * « inférée » devient « déclarée » quand son porteur l'affirme lui-même.
 */
export async function addProjectMemory(
  projectId: string,
  input: { dimension: string; statement: string },
): Promise<AddMemoryResult> {
  try {
    const item = await apiFetch<ProjectMemoryItem>(`/api/v1/projects/${projectId}/memory`, {
      method: "POST",
      json: { dimension: input.dimension, statement: input.statement, item_type: "declaration" },
    });
    return { ok: true, item };
  } catch (error) {
    return { ok: false, message: apiErrorMessage(error, "Enregistrement impossible. Réessaie.") };
  }
}

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
