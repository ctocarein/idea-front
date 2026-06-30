"use server";

import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

export type CompleteResult = { ok: true } | { ok: false; message: string };

/** Marque une leçon comme terminée. */
export async function completeLesson(slug: string): Promise<CompleteResult> {
  try {
    await apiFetch(`/api/v1/academy/lessons/${slug}/complete`, { method: "POST" });
    return { ok: true };
  } catch {
    return { ok: false, message: "Action impossible pour l'instant. Réessaie." };
  }
}

// --- Legacy Construire guidé ---

export type GuidedSessionData = components["schemas"]["GuidedSessionOut"];
export type GuidedResult = { ok: true; session: GuidedSessionData } | { ok: false; message: string };

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

// --- Modules Academy (nouveaux) ---

export interface WeaknessData {
  dimension: string;
  label: string;
  score: number;
  central_question: string;
  pillar: string;
  module_session_id: string | null;
  module_phase: string | null;
}

export interface WeaknessListData {
  weaknesses: WeaknessData[];
  dimensions_worked: number;
  has_radar: boolean;
}

export interface NeedFicheData {
  id: string;
  dimension: string;
  need_type: string;
  title: string;
  description: string;
  details: Record<string, unknown>;
  is_validated: boolean;
}

export interface ModuleSessionData {
  id: string;
  dimension: string | null;
  phase: string;
  turns: Array<{ role: string; text: string }>;
  form_data: Record<string, string> | null;
  form_sections: Array<{ key: string; label: string; hint: string }>;
  fiches: NeedFicheData[];
}

export type ModuleResult = { ok: true; session: ModuleSessionData } | { ok: false; message: string };

export async function getMyWeaknesses(): Promise<WeaknessListData> {
  return apiFetch<WeaknessListData>("/api/v1/academy/my-weaknesses");
}

export async function startModule(dimension: string): Promise<ModuleResult> {
  try {
    const session = await apiFetch<ModuleSessionData>("/api/v1/academy/modules/start", {
      method: "POST",
      json: { dimension },
    });
    return { ok: true, session };
  } catch {
    return { ok: false, message: "Impossible de démarrer le module. Réessaie." };
  }
}

export async function sendModuleTurn(sessionId: string, message: string): Promise<ModuleResult> {
  try {
    const session = await apiFetch<ModuleSessionData>(
      `/api/v1/academy/modules/${sessionId}/turn`,
      { method: "POST", json: { message } },
    );
    return { ok: true, session };
  } catch {
    return { ok: false, message: "Erreur lors de l'envoi. Réessaie." };
  }
}

export async function prefillModuleForm(sessionId: string): Promise<ModuleResult> {
  try {
    const session = await apiFetch<ModuleSessionData>(
      `/api/v1/academy/modules/${sessionId}/prefill-form`,
      { method: "POST" },
    );
    return { ok: true, session };
  } catch {
    return { ok: false, message: "Impossible de pré-remplir le formulaire. Réessaie." };
  }
}

export async function saveModuleForm(
  sessionId: string,
  formData: Record<string, string>,
): Promise<ModuleResult> {
  try {
    const session = await apiFetch<ModuleSessionData>(
      `/api/v1/academy/modules/${sessionId}/form`,
      { method: "PATCH", json: { form_data: formData } },
    );
    return { ok: true, session };
  } catch {
    return { ok: false, message: "Impossible d'enregistrer le formulaire. Réessaie." };
  }
}

export async function generateFiches(sessionId: string): Promise<ModuleResult> {
  try {
    const session = await apiFetch<ModuleSessionData>(
      `/api/v1/academy/modules/${sessionId}/generate-fiches`,
      { method: "POST" },
    );
    return { ok: true, session };
  } catch {
    return { ok: false, message: "Impossible de générer les fiches. Réessaie." };
  }
}

export async function getModule(sessionId: string): Promise<ModuleSessionData> {
  return apiFetch<ModuleSessionData>(`/api/v1/academy/modules/${sessionId}`);
}

export async function getMyFiches(): Promise<NeedFicheData[]> {
  return apiFetch<NeedFicheData[]>("/api/v1/academy/my-fiches");
}

export async function validateFiche(ficheId: string): Promise<{ ok: boolean }> {
  try {
    await apiFetch(`/api/v1/academy/fiches/${ficheId}/validate`, { method: "POST" });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
