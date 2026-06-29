"use server";

import { ApiError, apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

/**
 * Lancement du diagnostic guidé (Sprint INT). `POST /diagnostics` crée projet + bilan `pending`
 * et enqueue l'analyse (worker LLM) → réponse 202 avec le `report_id` à suivre (poll du bilan).
 */
type DiagnosticCreatedOut = components["schemas"]["DiagnosticCreatedOut"];

export type StartDiagnosticResult =
  | { ok: true; reportId: string }
  | { ok: false; message: string; unauthorized?: boolean };

export interface ManualDiagnosticPayload {
  projectName: string;
  sector: string;
  description: string;
  fundingNeed?: number;
  consent: boolean;
  answers: Record<string, string>;
}

export async function startManualDiagnostic(
  input: ManualDiagnosticPayload,
): Promise<StartDiagnosticResult> {
  try {
    const created = await apiFetch<DiagnosticCreatedOut>("/api/v1/diagnostics", {
      method: "POST",
      json: {
        projectName: input.projectName,
        sector: input.sector,
        description: input.description,
        consent: input.consent,
        fundingNeed: input.fundingNeed,
        answers: input.answers,
      },
    });
    return { ok: true, reportId: created.report_id };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) return { ok: false, message: "Connecte-toi pour lancer ton diagnostic.", unauthorized: true };
      if (error.status === 422) return { ok: false, message: "Vérifie les champs : il manque une information." };
    }
    return { ok: false, message: "Analyse impossible pour l'instant. Réessaie dans un instant." };
  }
}


// --- « Raconte, on structure » : extraction du récit libre → 12 dimensions ---

export interface ExtractedDimension {
  key: string;
  label: string;
  captured: boolean;
  evidence: string;
  question: string;
}

export interface IdeaExtract {
  project_name: string | null;
  captured_count: number;
  total: number;
  dimensions: ExtractedDimension[];
  gaps: ExtractedDimension[];
}

export type ExtractResult =
  | { ok: true; data: IdeaExtract }
  | { ok: false; message: string };

/** Récit libre → dimensions captées/manquantes (endpoint public + rate-limité). */
export async function extractIdea(
  idea: string,
  projectName?: string,
): Promise<ExtractResult> {
  try {
    const data = await apiFetch<IdeaExtract>("/api/v1/diagnostics/extract", {
      method: "POST",
      json: { idea, projectName, consent: true },
    });
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return { ok: false, message: "Trop de demandes — réessaie dans une minute." };
    }
    return { ok: false, message: "Analyse impossible pour l'instant. Réessaie." };
  }
}

export type ExtractFileResult =
  | { ok: true; data: IdeaExtract; description: string }
  | { ok: false; message: string };

/**
 * Upload PDF/DOCX → extraction de texte côté backend → même pipeline 'Raconte'.
 * Le `description` retourné est le texte brut extrait (utilisé dans le payload de scoring).
 */
export async function extractFileIdea(formData: FormData): Promise<ExtractFileResult> {
  try {
    const raw = await apiFetch<IdeaExtract & { source_text?: string }>(
      "/api/v1/diagnostics/extract-file",
      { method: "POST", formData },
    );
    return { ok: true, data: raw, description: raw.source_text ?? "" };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 413) return { ok: false, message: "Fichier trop grand (max 20 Mo)." };
      if (error.status === 415) return { ok: false, message: "Format non supporté (PDF ou DOCX uniquement)." };
      if (error.status === 422) return { ok: false, message: "Le document semble vide ou illisible. Essaie le flow 'Raconte'." };
      if (error.status === 429) return { ok: false, message: "Trop de demandes — réessaie dans une minute." };
      return { ok: false, message: `Erreur backend HTTP ${error.status} — ${JSON.stringify(error.detail)}` };
    }
    return { ok: false, message: `Erreur inattendue : ${String(error)}` };
  }
}
