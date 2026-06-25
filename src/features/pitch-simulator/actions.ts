"use server";

import { ApiError, apiFetch } from "@/shared/api/client";
import type { PitchSession } from "./api";

export type StartResult = { ok: true; sessionId: string } | { ok: false; message: string };
export type TurnResult = { ok: true; session: PitchSession } | { ok: false; message: string };

const failed = (message = "Action impossible pour l'instant. Réessaie.") =>
  ({ ok: false, message }) as const;

/** Crée une session de pitch (briefing) auprès du comité choisi. */
export async function startSession(
  committeeKey: string,
  format: string,
  projectId: string | null,
): Promise<StartResult> {
  try {
    const session = await apiFetch<PitchSession>("/api/v1/pitchsim/sessions", {
      method: "POST",
      json: {
        committee_key: committeeKey,
        format,
        ...(projectId ? { project_id: projectId } : {}),
      },
    });
    return { ok: true, sessionId: session.id };
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return failed("Lance d'abord ton diagnostic pour t'entraîner au pitch.");
    }
    return failed();
  }
}

async function post(sessionId: string, path: string, json?: unknown): Promise<TurnResult> {
  try {
    const session = await apiFetch<PitchSession>(
      `/api/v1/pitchsim/sessions/${sessionId}/${path}`,
      { method: "POST", ...(json !== undefined ? { json } : {}) },
    );
    return { ok: true, session };
  } catch {
    return failed();
  }
}

/** Briefing → le porteur prend la parole. */
export async function startPitch(id: string): Promise<TurnResult> {
  return post(id, "start-pitch");
}

/** Le porteur narre une partie de son pitch (le comité réagit en silence). */
export async function narrate(id: string, narration: string): Promise<TurnResult> {
  return post(id, "narrate", { narration });
}

/** Le porteur annonce la fin → passage en questions. */
export async function endPitch(id: string): Promise<TurnResult> {
  return post(id, "end-pitch");
}

/** Réponse à la question du juge courant. */
export async function respond(id: string, answer: string): Promise<TurnResult> {
  return post(id, "respond", { answer });
}

/** Déclenche la délibération (verdicts + scoring). */
export async function deliberate(id: string): Promise<TurnResult> {
  return post(id, "deliberate");
}

/** Abandon de la session. */
export async function abandon(id: string): Promise<TurnResult> {
  return post(id, "abandon");
}
