import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ApiError } from "@/shared/api/client";
import { Card, CardContent } from "@/shared/ui";
import { getLearningDashboard, type LearningDashboard } from "@/features/analytics";

export const metadata: Metadata = { title: "Learning dashboard" };

const STAGE_LABEL_KEY: Record<string, string> = {
  bilan_viewed: "bilanViewed",
  action_started: "actionStarted",
  opportunity_interest: "opportunityInterest",
};

export default async function AdminLearningDashboardPage() {
  const t = await getTranslations("Admin.analytics");

  let data: LearningDashboard | null = null;
  try {
    data = await getLearningDashboard();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  const pct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {!data ? (
        <Card>
          <CardContent className="pt-2">
            <p className="py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Funnel de transformation */}
          <Card>
            <CardContent className="space-y-4 pt-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("funnelTitle")}
              </h2>
              <ol className="space-y-3">
                {data.funnel.map((stage, i) => {
                  const labelKey = STAGE_LABEL_KEY[stage.stage];
                  const label = labelKey && t.has(labelKey) ? t(labelKey) : stage.stage;
                  return (
                    <li key={stage.stage} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-sm text-muted-foreground">
                          {t("actorsCount", { count: stage.actors })}
                          {i > 0 && <span className="ml-2 tabular-nums">· {pct(stage.conversion)}</span>}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: pct(stage.conversion) }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          {/* Compteurs d'événements bruts */}
          <Card>
            <CardContent className="space-y-4 pt-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("eventsTitle", { total: data.total_events })}
              </h2>
              {Object.keys(data.event_counts).length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noEvents")}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {Object.entries(data.event_counts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => (
                      <li key={name} className="flex items-center justify-between py-2 text-sm">
                        <span className="font-mono text-xs text-muted-foreground">{name}</span>
                        <span className="font-medium tabular-nums">{count}</span>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
