"use server";

import { apiFetch } from "@/shared/api/client";

// --- Modules Academy (Workshop) ---

export interface WeaknessData {
  dimension: string;
  label: string;
  score: number;
  central_question: string;
  pillar: string;
  module_session_id: string | null;
  module_phase: string | null;
  is_reinforced: boolean;
  original_score: number;
  is_rescored: boolean;
}

export interface WeaknessListData {
  weaknesses: WeaknessData[];
  dimensions_worked: number;
  dimensions_reinforced: number;
  reinforced_dimensions: string[];
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
  turns: Array<{ role: string; text: string; ready?: boolean }>;
  form_data: Record<string, string> | null;
  form_sections: Array<{ key: string; label: string; hint: string }>;
  fiches: NeedFicheData[];
  context_ready: boolean;
  axis_score_before: number | null;
  axis_score_after: number | null;
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

export async function rescoreAxis(sessionId: string): Promise<ModuleResult> {
  try {
    const session = await apiFetch<ModuleSessionData>(
      `/api/v1/academy/modules/${sessionId}/rescore`,
      { method: "POST" },
    );
    return { ok: true, session };
  } catch {
    return { ok: false, message: "Impossible de mesurer ta progression. Réessaie." };
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
