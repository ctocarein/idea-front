"use server";

import { ApiError, apiFetch } from "@/shared/api/client";

export type ShareActionResult =
  | { ok: true; token?: string; path?: string }
  | { ok: false; message: string };

export async function createShare(projectId: string): Promise<ShareActionResult> {
  try {
    const res = await apiFetch<{ token: string; path: string }>(
      `/api/v1/projects/${projectId}/share`,
      { method: "POST", json: { consent: true } },
    );
    return { ok: true, token: res.token, path: res.path };
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      return { ok: false, message: "Aucun bilan prêt à partager pour ce projet." };
    }
    return { ok: false, message: "Impossible de créer le lien. Réessaie." };
  }
}

export async function revokeShare(projectId: string): Promise<ShareActionResult> {
  try {
    await apiFetch(`/api/v1/projects/${projectId}/share`, { method: "DELETE" });
    return { ok: true };
  } catch {
    return { ok: false, message: "Impossible de révoquer le lien. Réessaie." };
  }
}
