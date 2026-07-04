import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowRight, CheckCircle2, Target, TrendingUp, Zap, Layers } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { Button, Card, CardContent } from "@/shared/ui";
import type { WeaknessListData } from "../actions";

/** Icône + couleur par pilier (le libellé vient du namespace Radar). */
const PILLAR_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  sens: { icon: Target, color: "text-coral-strong" },
  viabilite: { icon: TrendingUp, color: "text-amber-500" },
  scalabilite: { icon: Zap, color: "text-blue-500" },
  execution: { icon: Layers, color: "text-violet-500" },
};

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score <= 3 ? "bg-red-400" : score <= 6 ? "bg-amber-400" : "bg-success";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold tabular-nums w-8 text-right">{score}/10</span>
    </div>
  );
}

export function WeaknessCards({ data }: { data: WeaknessListData }) {
  const t = useTranslations("Workshop.weakness");
  const tRadar = useTranslations("Radar");

  if (!data.has_radar) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">{t("noRadarTitle")}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t("noRadarText")}
        </p>
        <Link href={routes.diagnostic}>
          <Button className="mt-4" size="sm" variant="outline">
            {t("noRadarCta")}
          </Button>
        </Link>
      </div>
    );
  }

  if (data.weaknesses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-8 text-success" />
        <p className="text-sm font-medium">{t("allSolidTitle")}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t("allSolidText")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {t.rich("reinforced", {
            count: data.dimensions_reinforced,
            b: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>,
          })}
          {data.dimensions_worked > data.dimensions_reinforced && (
            <span className="text-muted-foreground/70">
              {t("inProgress", { count: data.dimensions_worked - data.dimensions_reinforced })}
            </span>
          )}
        </p>
        <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{ width: `${(data.dimensions_reinforced / 12) * 100}%` }}
          />
        </div>
      </div>

      {data.weaknesses.map((w) => {
        const pillar = PILLAR_CONFIG[w.pillar] ?? { icon: Target, color: "text-muted-foreground" };
        const pillarLabel = PILLAR_CONFIG[w.pillar] ? tRadar(`pillars.${w.pillar}.label`) : w.pillar;
        const PillarIcon = pillar.icon;
        const hasModule = !!w.module_session_id;
        const phase = w.module_phase;
        const reinforced = w.is_reinforced;

        return (
          <Card
            key={w.dimension}
            className={`group transition-shadow hover:shadow-sm ${reinforced ? "border-success/40 bg-success/5" : ""}`}
          >
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${pillar.color}`}>
                      <PillarIcon className="inline size-3 mr-1" />
                      {pillarLabel}
                    </span>
                    {reinforced ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                        <CheckCircle2 className="size-3" /> {t("reinforcedBadge")}
                      </span>
                    ) : hasModule && phase ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {t.has(`phase.${phase}`) ? t(`phase.${phase}`) : phase}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="font-display font-bold text-base">{w.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {w.central_question}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <ScoreBar score={w.score} />
                {w.is_rescored && w.score !== w.original_score && (
                  <p className="text-xs text-muted-foreground">
                    {t("sinceDiagnostic")}{" "}
                    <span className="text-muted-foreground/70">{w.original_score}</span>
                    {" → "}
                    <span className={`font-semibold ${w.score > w.original_score ? "text-success" : "text-foreground"}`}>
                      {w.score}
                    </span>
                    {w.score > w.original_score && (
                      <span className="ml-1 font-semibold text-success">
                        (+{w.score - w.original_score})
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Link href={`/dashboard/academy/module/${w.dimension}${w.module_session_id ? `?session=${w.module_session_id}` : ""}`}>
                  <Button size="sm" variant={hasModule ? "outline" : "primary"}>
                    {reinforced ? t("ctaReinforced") : hasModule ? t("ctaContinue") : t("ctaWork")}
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
