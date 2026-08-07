"use server";

import { apiFetch } from "@/shared/api/client";

/** Relance un job (admin) — `POST /admin/jobs/{id}/retry`, audité côté backend. */
export async function retryJob(jobId: string): Promise<{ ok: boolean }> {
  try {
    await apiFetch(`/api/v1/admin/jobs/${jobId}/retry`, { method: "POST" });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
