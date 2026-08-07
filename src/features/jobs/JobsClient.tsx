"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { RotateCw } from "lucide-react";

import { Button, Card, CardContent, toast } from "@/shared/ui";

import type { Job, JobStats } from "./api";
import { retryJob } from "./actions";

const STATUS_STYLE: Record<string, string> = {
  succeeded: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  running: "bg-primary/15 text-primary",
  pending: "bg-secondary text-muted-foreground",
  scheduled: "bg-secondary text-muted-foreground",
};

function StatusPill({ status }: { status: string }) {
  const cls = STATUS_STYLE[status] ?? "bg-secondary text-muted-foreground";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

interface Props {
  jobs: Job[];
  stats: JobStats;
}

export function JobsClient({ jobs, stats }: Props) {
  const t = useTranslations("Admin.jobs");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  function handleRetry(jobId: string) {
    startTransition(async () => {
      const result = await retryJob(jobId);
      if (!result.ok) {
        toast.error(t("retryError"));
        return;
      }
      toast.success(t("retryDone"));
      router.refresh();
    });
  }

  const statEntries = Object.entries(stats);

  return (
    <div className="space-y-6">
      {/* Compteurs par statut */}
      {statEntries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statEntries.map(([status, count]) => (
            <Card key={status}>
              <CardContent className="space-y-1 pt-4">
                <p className="text-2xl font-bold tabular-nums">{count}</p>
                <StatusPill status={status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="pt-2">
          {jobs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {jobs.map((job) => (
                <li key={job.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{job.type}</span>
                      <StatusPill status={job.status} />
                      {job.retry_count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {t("attempts", { count: job.retry_count, max: job.max_retries })}
                        </span>
                      )}
                    </p>
                    {job.error_message && (
                      <p className="truncate text-xs text-destructive" title={job.error_message}>
                        {job.error_message}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {dateFmt.format(new Date(job.created_at))}
                    </span>
                    {job.status === "failed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetry(job.id)}
                        disabled={isPending}
                      >
                        <RotateCw className="mr-1 size-3.5" />
                        {t("retry")}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
