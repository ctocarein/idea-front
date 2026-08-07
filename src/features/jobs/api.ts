import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

/**
 * Supervision des jobs (admin, Sprint 6). File de tâches asynchrones du worker.
 * `GET /admin/jobs`, `GET /admin/jobs/stats`. Relance : cf. `./actions`.
 */
export type Job = components["schemas"]["JobOut"];
export type JobStats = Record<string, number>;

export async function getJobs(status?: string): Promise<Job[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<Job[]>(`/api/v1/admin/jobs${qs}`);
}

export async function getJobStats(): Promise<JobStats> {
  return apiFetch<JobStats>("/api/v1/admin/jobs/stats");
}
