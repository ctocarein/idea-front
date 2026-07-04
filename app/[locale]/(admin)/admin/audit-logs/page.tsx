import type { Metadata } from "next";

import { ApiError } from "@/shared/api/client";
import { Card, CardContent } from "@/shared/ui";
import { actionLabel, getAuditLogs, transitionText } from "@/features/audit/api";

export const metadata: Metadata = { title: "Audit logs" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminAuditLogsPage() {
  let logs: Awaited<ReturnType<typeof getAuditLogs>> = [];
  try {
    logs = await getAuditLogs();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Audit logs</h1>
        <p className="text-muted-foreground">
          Chaque action sensible est tracée — pouvoir = traçabilité.
        </p>
      </div>

      <Card>
        <CardContent className="pt-2">
          {logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucune action tracée pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {logs.map((log) => {
                const transition = transitionText(log);
                return (
                  <li key={log.id} className="flex items-center justify-between gap-3 py-3">
                    <p className="min-w-0 text-sm">
                      <span className="font-medium">{actionLabel(log.action)}</span>{" "}
                      <span className="text-muted-foreground">sur {log.entity}</span>
                      {transition ? (
                        <span className="tabular ml-1 text-muted-foreground">· {transition}</span>
                      ) : null}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {dateFmt.format(new Date(log.created_at))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
