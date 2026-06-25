"use server";

import { apiFetch } from "@/shared/api/client";

export type CompleteResult = { ok: true } | { ok: false; message: string };

/** Marque une leçon comme terminée (met à jour `learning_progress`). */
export async function completeLesson(slug: string): Promise<CompleteResult> {
  try {
    await apiFetch(`/api/v1/academy/lessons/${slug}/complete`, { method: "POST" });
    return { ok: true };
  } catch {
    return { ok: false, message: "Action impossible pour l'instant. Réessaie." };
  }
}
