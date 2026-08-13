"use server";

import { ApiError, apiErrorMessage, apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

type ReportStatus = components["schemas"]["ReportStatus"];
type ScoreAdjustIn = components["schemas"]["ScoreAdjustIn"];
type ScoreResult = components["schemas"]["ScoreResult"];
type DiagnosticReport = components["schemas"]["DiagnosticReport"];
type ReportDetailOut = components["schemas"]["ReportDetailOut"];

export type EditResult<T> = { ok: true; data: T } | { ok: false; message: string };

export type PdfResult = { ok: true; url: string } | { ok: false; reason: "pending" | "error" };

/** URL présignée du PDF du bilan (généré par le worker). `pending` si pas encore prêt (409). */
export async function getReportPdfUrl(reportId: string): Promise<PdfResult> {
  try {
    const link = await apiFetch<{ url: string }>(`/api/v1/reports/${reportId}/pdf`);
    return { ok: true, url: link.url };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) return { ok: false, reason: "pending" };
    return { ok: false, reason: "error" };
  }
}

/**
 * Le porteur démarre une prochaine action — `POST /reports/{id}/actions/{key}/start`.
 *
 * L'appel n'a pas de rendu visible : il émet l'event `action_started`, l'étage central du
 * funnel de transformation (`bilan_viewed → action_started → opportunity_interest`) que
 * mesure le tableau d'apprentissage. Sans lui, la métrique nord du produit reste creuse.
 * On n'empêche donc jamais la navigation si l'enregistrement échoue.
 */
export async function startNextAction(reportId: string, actionKey: string): Promise<boolean> {
  try {
    await apiFetch(`/api/v1/reports/${reportId}/actions/${encodeURIComponent(actionKey)}/start`, {
      method: "POST",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Reprise humaine des 12 dimensions — `PATCH /reports/{id}/scores`.
 *
 * Le backend crée un `ScoreRun` de source `human` : le score cesse d'être une lecture
 * de l'IA pour devenir un jugement assumé par quelqu'un. Réservé à l'analyste assigné
 * ou à un admin (garde backend `guard_assigned_or_admin`).
 */
export async function adjustReportScores(
  reportId: string,
  payload: ScoreAdjustIn,
): Promise<EditResult<ScoreResult>> {
  try {
    const result = await apiFetch<ScoreResult>(`/api/v1/reports/${reportId}/scores`, {
      method: "PATCH",
      json: payload,
    });
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, message: apiErrorMessage(error, "Enregistrement des scores impossible.") };
  }
}

/**
 * Correction de la couche rédigée du bilan — `PATCH /reports/{id}/report`.
 * Fusion superficielle côté backend : seuls les champs envoyés écrasent l'existant,
 * on ne renvoie donc que ce qui a été touché.
 */
export async function editReportContent(
  reportId: string,
  patch: DiagnosticReport,
): Promise<EditResult<ReportDetailOut>> {
  try {
    const result = await apiFetch<ReportDetailOut>(`/api/v1/reports/${reportId}/report`, {
      method: "PATCH",
      json: patch,
    });
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, message: apiErrorMessage(error, "Enregistrement du bilan impossible.") };
  }
}

/** Poll d'avancement d'un bilan (généré en asynchrone par le worker LLM). `null` si erreur. */
export async function pollReportStatus(reportId: string): Promise<ReportStatus | null> {
  try {
    const report = await apiFetch<components["schemas"]["ReportOut"]>(
      `/api/v1/reports/${reportId}`,
    );
    return report.status;
  } catch {
    return null;
  }
}
