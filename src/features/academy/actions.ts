"use server";

import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

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

// --- Construire guidé ---

export type GuidedSessionData = components["schemas"]["GuidedSessionOut"];
export type GuidedResult = { ok: true; session: GuidedSessionData } | { ok: false; message: string };

/** Démarre une session guidée sur la section choisie. */
export async function startGuidedSession(section: string): Promise<GuidedResult> {
  try {
    const session = await apiFetch<GuidedSessionData>("/api/v1/academy/build/start", {
      method: "POST",
      json: { section },
    });
    return { ok: true, session };
  } catch {
    return { ok: false, message: "Impossible de démarrer la session. Réessaie." };
  }
}

/** Envoie un message au coach et retourne la session mise à jour (turns + réponse IA). */
export async function sendGuidedTurn(sessionId: string, message: string): Promise<GuidedResult> {
  try {
    const session = await apiFetch<GuidedSessionData>(
      `/api/v1/academy/build/${sessionId}/turn`,
      { method: "POST", json: { message } },
    );
    return { ok: true, session };
  } catch {
    return { ok: false, message: "Erreur lors de l'envoi. Réessaie." };
  }
}

/** Sauvegarde le brouillon du porteur (fire-and-forget). */
export async function saveGuidedDraft(sessionId: string, draft: string): Promise<{ ok: boolean }> {
  try {
    await apiFetch(`/api/v1/academy/build/${sessionId}/draft`, {
      method: "PATCH",
      json: { draft },
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
