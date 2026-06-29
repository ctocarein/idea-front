import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Flag, GraduationCap, Sparkles, Users } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Badge, Button, Card, CardContent } from "@/shared/ui";
import {
  AXES,
  LEVERS,
  ComprehensionTable,
  RadarChart,
  TONE_TO_BADGE,
  maturityLevel,
  overallScore,
  type AxisKey,
} from "@/features/scoring";
import { type ReportDetail, toRadarScore } from "../api";
import { BilanPdfButton } from "./BilanPdfButton";

/** Mapping verdict backend → variante de badge. */
const VERDICT_BADGE: Record<string, "success" | "warning" | "neutral"> = {
  go: "success",
  conditional: "warning",
  nogo: "neutral",
};

/**
 * Bilan de diagnostic (vue porteur). Le tableau de compréhension d'abord (pédagogique),
 * le Radar en appui, puis verdict / forces / risques / recommandations. Ton non culpabilisant.
 */
export function BilanView({ report }: { report: ReportDetail }) {
  const radar = report.radar_score ? toRadarScore(report.radar_score) : null;
  const overall = radar ? overallScore(radar) : null;
  const maturity = overall !== null ? maturityLevel(overall) : null;
  const insights = report.report ?? null;
  const verdict = insights?.verdict;
  const strengths = insights?.strengths ?? [];
  const risks = insights?.risks ?? [];
  const recommendations = insights?.recommendations ?? [];

  // Fil rouge : la dimension la plus faible = le point de rupture n°1 à attaquer en premier.
  const weakest = radar
    ? AXES.map((a) => ({ key: a.key as AxisKey, label: a.label, score: radar.axes[a.key] ?? 0 })).sort(
        (x, y) => x.score - y.score,
      )[0]
    : null;
  const weakestLever = weakest ? LEVERS[weakest.key] : null;
  const academyUrl =
    weakestLever?.type === "academy"
      ? routes.academyTopic(weakestLever.topic)
      : routes.academy;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-dawn text-ink">
            <Sparkles className="size-6" />
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight">{report.title}</h1>
          {insights?.summary ? (
            <p className="max-w-2xl text-muted-foreground">{insights.summary}</p>
          ) : null}
        </div>
        {verdict?.label ? (
          <Badge variant={VERDICT_BADGE[verdict.status] ?? "neutral"}>{verdict.label}</Badge>
        ) : null}
      </div>

      {/* Fil rouge — le point de rupture n°1 + les leviers (Academy, mentors, rapport) */}
      {weakest ? (
        <Card className="border-coral-strong/30 bg-coral/5">
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center gap-2 text-sm font-medium text-coral-strong">
              <Flag className="size-4" />
              Ton fil rouge — commence ici
            </div>
            <p className="font-display text-lg font-bold">
              {weakest.label} · {weakest.score}/10
            </p>
            <p className="text-sm text-muted-foreground">
              C&apos;est ton point de rupture n°1 — le renforcer débloque le reste de ton radar.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild>
                <Link href={academyUrl}>
                  <GraduationCap className="size-5" />
                  Renforcer dans l&apos;Academy
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={routes.mentors}>
                  <Users className="size-5" />
                  Mentors référents
                </Link>
              </Button>
              <BilanPdfButton reportId={report.id} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Boussole + compréhension */}
      {radar ? (
        <>
          <Card>
            <CardContent className="grid items-center gap-6 pt-6 sm:grid-cols-[auto_1fr]">
              <div className="mx-auto">
                <RadarChart score={radar} size={260} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Ta boussole
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="tabular font-display text-3xl font-extrabold">{overall}</span>
                  <span className="text-muted-foreground">/100</span>
                  {maturity ? (
                    <Badge variant={TONE_TO_BADGE[maturity.tone]}>{maturity.label}</Badge>
                  ) : null}
                </div>
                {maturity ? (
                  <p className="text-sm text-muted-foreground">{maturity.description}</p>
                ) : verdict?.analysis ? (
                  <p className="text-sm text-muted-foreground">{verdict.analysis}</p>
                ) : null}
                <Button asChild variant="ghost" size="sm" className="mt-1 -ml-2">
                  <Link href={routes.readiness}>
                    Suis-je prêt ?
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold tracking-tight">
              Ton tableau de compréhension
            </h2>
            <ComprehensionTable score={radar} />
          </section>
        </>
      ) : null}

      {/* Forces & risques */}
      {strengths.length > 0 || risks.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {strengths.length > 0 ? (
            <Card>
              <CardContent className="space-y-3 pt-6">
                <h3 className="flex items-center gap-2 font-display text-base font-bold">
                  <CheckCircle2 className="size-5 text-success" />
                  Tes forces
                </h3>
                <ul className="space-y-2">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" />
                      {s.text}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
          {risks.length > 0 ? (
            <Card>
              <CardContent className="space-y-3 pt-6">
                <h3 className="flex items-center gap-2 font-display text-base font-bold">
                  <AlertTriangle className="size-5 text-warning" />
                  Tes angles morts
                </h3>
                <ul className="space-y-2">
                  {risks.map((risk, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                      {risk.text}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {/* Recommandations */}
      {recommendations.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold tracking-tight">Tes prochaines étapes</h2>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="tabular mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{rec.title}</p>
                  {rec.description ? (
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button asChild>
          <Link href={routes.dashboard}>
            Aller à mon espace
            <ArrowRight className="size-5" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={routes.academy}>Apprendre avec l&apos;Academy</Link>
        </Button>
      </div>
    </div>
  );
}
