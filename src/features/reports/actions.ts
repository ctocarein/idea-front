"use server";

import { ApiError, apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

type ReportStatus = components["schemas"]["ReportStatus"];

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
