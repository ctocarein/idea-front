import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";

import { ApiError } from "@/shared/api/client";
import { Card, CardContent } from "@/shared/ui";
import { getAuditLogs, transitionText } from "@/features/audit/api";

export const metadata: Metadata = { title: "Audit logs" };

export default async function AdminAuditLogsPage() {
  const t = await getTranslations("Admin.audit");
  const locale = await getLocale();
  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
  let logs: Awaited<ReturnType<typeof getAuditLogs>> = [];
  try {
    logs = await getAuditLogs();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <Card>
        <CardContent className="pt-2">
          {logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("empty")}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {logs.map((log) => {
                const transition = transitionText(log);
                const actionKey = log.action.replaceAll(".", "_");
                return (
                  <li key={log.id} className="flex items-center justify-between gap-3 py-3">
                    <p className="min-w-0 text-sm">
                      <span className="font-medium">
                        {t.has(`actions.${actionKey}`) ? t(`actions.${actionKey}`) : log.action}
                      </span>{" "}
                      <span className="text-muted-foreground">{t("on", { entity: log.entity })}</span>
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
