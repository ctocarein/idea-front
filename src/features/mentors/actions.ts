"use server";

import { ApiError, apiFetch } from "@/shared/api/client";

export type MentorActionResult = { ok: true } | { ok: false; message: string };

/** Approuver une candidature mentor → crée le compte + l'invitation (admin). */
export async function approveApplication(applicationId: string): Promise<MentorActionResult> {
  try {
    await apiFetch(`/api/v1/admin/mentor-applications/${applicationId}/approve`, {
      method: "POST",
    });
    return { ok: true };
  } catch {
    return { ok: false, message: "Approbation impossible. Réessaie." };
  }
}

/** Rejeter une candidature mentor (admin). */
export async function rejectApplication(applicationId: string): Promise<MentorActionResult> {
  try {
    await apiFetch(`/api/v1/admin/mentor-applications/${applicationId}/reject`, {
      method: "POST",
    });
    return { ok: true };
  } catch {
    return { ok: false, message: "Action impossible. Réessaie." };
  }
}

/** Activer / suspendre un mentor (admin). */
export async function setMentorActive(
  userId: string,
  active: boolean,
): Promise<MentorActionResult> {
  try {
    await apiFetch(`/api/v1/admin/mentors/${userId}/${active ? "activate" : "suspend"}`, {
      method: "POST",
    });
    return { ok: true };
  } catch {
    return { ok: false, message: "Action impossible. Réessaie." };
  }
}

// --- Transitions MentorRequest (V1-07) ---

import type { MentorRequestDetail } from "./api";

export type RequestResult =
  | { ok: true; data: MentorRequestDetail }
  | { ok: false; message: string };

export async function acceptRequest(requestId: string): Promise<RequestResult> {
  try {
    const data = await apiFetch<MentorRequestDetail>(
      `/api/v1/mentor-requests/${requestId}/accept`,
      { method: "PATCH" },
    );
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Action impossible. Réessaie." };
  }
}

export async function declineRequest(requestId: string): Promise<RequestResult> {
  try {
    const data = await apiFetch<MentorRequestDetail>(
      `/api/v1/mentor-requests/${requestId}/decline`,
      { method: "PATCH" },
    );
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Action impossible. Réessaie." };
  }
}

export async function planSession(
  requestId: string,
  sessionAt: string,
): Promise<RequestResult> {
  try {
    const data = await apiFetch<MentorRequestDetail>(
      `/api/v1/mentor-requests/${requestId}/plan-session`,
      { method: "PATCH", json: { session_at: sessionAt } },
    );
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Impossible de planifier. Réessaie." };
  }
}

export async function completeRequest(requestId: string): Promise<RequestResult> {
  try {
    const data = await apiFetch<MentorRequestDetail>(
      `/api/v1/mentor-requests/${requestId}/complete`,
      { method: "PATCH" },
    );
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Action impossible. Réessaie." };
  }
}

export async function cancelRequest(requestId: string): Promise<RequestResult> {
  try {
    const data = await apiFetch<MentorRequestDetail>(
      `/api/v1/mentor-requests/${requestId}/cancel`,
      { method: "PATCH" },
    );
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Impossible d'annuler. Réessaie." };
  }
}

/** Demande d'accompagnement d'un porteur vers un mentor. */
export async function requestMentor(
  mentorUserId: string,
  projectId: string,
  message: string,
): Promise<MentorActionResult> {
  try {
    await apiFetch(`/api/v1/mentors/${mentorUserId}/request`, {
      method: "POST",
      json: { project_id: projectId, message },
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { ok: false, message: "Tu as déjà sollicité ce mentor." };
    }
    return { ok: false, message: "Demande impossible. Réessaie." };
  }
}
