import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { ArrowRight, Compass, Heart, Sparkles } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { Button, Card, CardContent, EmptyState } from "@/shared/ui";
import type { LearningDashboard } from "@/features/analytics";

/**
 * Vue d'ensemble admin (épic INSTRUM ★) — la métrique nord est la TRANSFORMATION,
 * pas le revenu.
 *
 * On n'affiche QUE ce que le backend mesure réellement (`GET /admin/learning-dashboard` :
 * les trois étages du funnel + le volume d'événements). Les indicateurs qu'aucun event
 * n'alimente encore — rétention par cohorte, progression Radar avant/après, pitchs joués —
 * ne sont pas rendus : un chiffre inventé sur un écran de pilotage est pire que pas de chiffre.
 */

const STAGE_ICON: Record<string, LucideIcon> = {
  bilan_viewed: Compass,
  action_started: Sparkles,
  opportunity_interest: Heart,
};

const STAGE_LABEL_KEY: Record<string, string> = {
  bilan_viewed: "bilanViewed",
  action_started: "actionStarted",
  opportunity_interest: "opportunityInterest",
};

export function AdminOverview({ data }: { data: LearningDashboard | null }) {
  const t = useTranslations("Admin.overview");
  const tStage = useTranslations("Admin.analytics");

  if (!data || data.funnel.length === 0) {
    return <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {data.funnel.map((stage, i) => {
          const Icon = STAGE_ICON[stage.stage] ?? Compass;
          const labelKey = STAGE_LABEL_KEY[stage.stage];
          return (
            <Card key={stage.stage}>
              <CardContent className="space-y-1 pt-6">
                <span className="flex size-9 items-center justify-center rounded-full bg-coral/15 text-coral-strong">
                  <Icon className="size-5" />
                </span>
                <p className="tabular font-display text-2xl font-extrabold">{stage.actors}</p>
                <p className="text-sm font-medium">
                  {labelKey && tStage.has(labelKey) ? tStage(labelKey) : stage.stage}
                </p>
                {/* Le premier étage est la base : afficher « 100 % » n'apprendrait rien. */}
                {i > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {t("conversion", { pct: Math.round(stage.conversion * 100) })}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div>
            <h2 className="font-display text-base font-bold">{t("detailTitle")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("totalEvents", { total: data.total_events })}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.adminLearningDashboard}>
              {t("detailLink")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
