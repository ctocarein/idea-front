import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ApiError } from "@/shared/api/client";
import { getJobs, getJobStats, JobsClient, type Job, type JobStats } from "@/features/jobs";

export const metadata: Metadata = { title: "Jobs" };

export default async function AdminJobsPage() {
  const t = await getTranslations("Admin.jobs");

  let jobs: Job[] = [];
  let stats: JobStats = {};
  try {
    [jobs, stats] = await Promise.all([getJobs(), getJobStats()]);
  } catch (error) {
    // 403 (rôle sans JOBS_MANAGE) ou backend KO → état vide, pas de crash.
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <JobsClient jobs={jobs} stats={stats} />
    </div>
  );
}
