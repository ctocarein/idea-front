import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight, GraduationCap, Mic, type LucideIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { features } from "@/shared/config/features";
import { Badge, Button, Card, CardContent } from "@/shared/ui";
import {
  AXES,
  LEVERS,
  RadarChart,
  TONE_TO_BADGE,
  maturityLevel,
  type AxisKey,
  type MaturityLevel,
} from "@/features/scoring";
import { getMaturityLevels } from "@/features/scoring/api";
import { getLatestRadar } from "@/features/reports/api";
import { NewDiagnosticModal } from "@/features/diagnostics";
import { ExpressInterest } from "./_interest";

export const metadata: Metadata = { title: "Readiness" };

/** Clé de libellé du CTA selon le type de levier (traduit au rendu). */
type LeverLabelKey = "goWorkshop" | "practicePitch" | "findMentor";
function leverCta(key: AxisKey): { href: string; labelKey: LeverLabelKey; icon: LucideIcon } {
  const lever = LEVERS[key];
  const workshop = { href: routes.academy, labelKey: "goWorkshop" as const, icon: GraduationCap };
  switch (lever.type) {
    case "academy":
      return { href: routes.academyTopic(lever.topic), labelKey: "goWorkshop", icon: GraduationCap };
    case "pitchsim":
      // Simulateur repoussé en V2 → on renvoie vers le Workshop tant qu'il est masqué.
      return features.pitchSimulator
        ? { href: routes.pitchSim, labelKey: "practicePitch", icon: Mic }
        : workshop;
    case "mentor":
      // Mentorat repoussé en V2 → fallback Workshop.
      return features.mentors
        ? { href: routes.mentors, labelKey: "findMentor", icon: ArrowUpRight }
        : workshop;
    default:
      return workshop;
  }
}

export default async function ReadinessPage() {
  const score = await getLatestRadar();
  const t = await getTranslations("Readiness");
  // Chargés ici, dans le composant SERVEUR : `ReadinessContent` est synchrone (il utilise
  // `useTranslations`), il reçoit donc les paliers plutôt que d'aller les chercher.
  const maturityLevels = score ? await getMaturityLevels().catch(() => []) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {score ? (
        <ReadinessContent score={score} maturityLevels={maturityLevels} />
      ) : (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-8">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">
                {t("emptyTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">{t("emptyText")}</p>
            </div>
            <NewDiagnosticModal>
              {t("emptyCta")}
              <ArrowRight className="size-4" />
            </NewDiagnosticModal>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReadinessContent({
  score,
  maturityLevels,
}: {
  score: NonNullable<Awaited<ReturnType<typeof getLatestRadar>>>;
  maturityLevels: readonly MaturityLevel[];
}) {
  const t = useTranslations("Readiness");
  const tRadar = useTranslations("Radar");
  // Le global est SERVI, jamais recalculé : moyenne pondérée par secteur, que le front ne
  // peut pas reproduire faute d'avoir les poids. Les paliers viennent de la même grille —
  // une seule définition dans le système. Best-effort : sans grille, le palier est absent.
  const overall = score.overall ?? null;
  const maturity = overall !== null ? maturityLevel(overall, maturityLevels) : null;
  const weak = [...AXES]
    .sort((a, b) => (score.axes[a.key] ?? 0) - (score.axes[b.key] ?? 0))
    .slice(0, 3);

  return (
    <>
      <Card>
        <CardContent className="grid items-center gap-6 pt-6 sm:grid-cols-[auto_1fr]">
          <div className="mx-auto">
            <RadarChart score={score} size={240} />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="tabular font-display text-3xl font-extrabold">{overall ?? "—"}</span>
              <span className="text-muted-foreground">/100</span>
              {maturity ? (
                <Badge variant={TONE_TO_BADGE[maturity.tone]}>
                  {tRadar(`maturity.${maturity.key}.label`)}
                </Badge>
              ) : null}
            </div>
            {maturity ? (
              <p className="text-sm text-muted-foreground">
                {tRadar(`maturity.${maturity.key}.description`)}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold tracking-tight">{t("remaining")}</h2>
        <div className="space-y-2">
          {weak.map((axis) => {
            const cta = leverCta(axis.key as AxisKey);
            const Icon = cta.icon;
            return (
              <div
                key={axis.key}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="tabular mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                  {score.axes[axis.key]}
                </span>
                <div className="flex-1 space-y-2">
                  <p className="font-medium">{tRadar(`${axis.key}.label`)}</p>
                  <p className="text-sm text-muted-foreground">{t(`hints.${axis.key}`)}</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={cta.href}>
                      <Icon className="size-4" />
                      {t(cta.labelKey)}
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Invitation Phase Pro — jamais une injonction (BESOINS_PORTEUR cas 4) */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="size-5 text-coral-strong" />
            <h2 className="font-display text-lg font-bold tracking-tight">
              {t("proTitle")}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">{t("proText")}</p>
          <ExpressInterest />
        </CardContent>
      </Card>
    </>
  );
}
