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
  | { ok: false; message: string };

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
      if (error.status === 401) return { ok: false, message: "Connecte-toi pour lancer ton diagnostic." };
      if (error.status === 422) return { ok: false, message: "Vérifie les champs : il manque une information." };
    }
    return { ok: false, message: "Analyse impossible pour l'instant. Réessaie dans un instant." };
  }
}
