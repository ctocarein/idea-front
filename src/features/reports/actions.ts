"use server";

import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

type ReportStatus = components["schemas"]["ReportStatus"];

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
