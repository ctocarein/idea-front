import type { Metadata } from "next";
import { ArrowRight, Compass, GraduationCap, Palette, Plus, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { routes } from "@/shared/config/routes";
import { Link } from "@/i18n/navigation";
import { getSession } from "@/shared/auth/server";
import { ApiError, apiFetch } from "@/shared/api/client";
import { EmailVerifyNudge } from "@/features/auth";
import { Badge, Button, Card, CardContent } from "@/shared/ui";
import {
  ComprehensionTable,
  RadarChart,
  TONE_TO_BADGE,
  maturityLevel,
  overallScore,
  sampleScore,
} from "@/features/scoring";
import { ClaimPendingDiagnostic } from "@/features/diagnostics";
import { ReportsList } from "@/features/reports";
import { getMyReports, getReportDetail, toRadarScore, toReportCard } from "@/features/reports/api";
import type { RadarScore } from "@/features/scoring";
import { NotificationsList } from "@/features/notifications";
import { DocumentsManager } from "@/features/documents";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const session = await getSession();
  const firstName = session?.name.split(" ")[0] ?? "porteur";
  const t = await getTranslations("Dashboard");
  const tr = await getTranslations("Radar");

  // Statut de vérification email (source autoritative) — défaut `true` pour éviter un faux nudge.
  let emailVerified = true;
  try {
    const me = await apiFetch<{ user: { email_verified?: boolean } }>("/api/v1/auth/me");
    emailVerified = me.user.email_verified ?? true;
  } catch {
    // réseau/session KO → on n'affiche pas le nudge
  }

  // Données réelles : les bilans du porteur. Réseau KO → on dégrade en « pas encore de diagnostic ».
  let reports: Awaited<ReturnType<typeof getMyReports>> = [];
  try {
    reports = await getMyReports();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  if (reports.length === 0) {
    return <EmptyDashboard firstName={firstName} />;
  }

  const reportCards = reports.map(toReportCard);

  // Score réel : le dernier bilan prêt (radar v2 12 dimensions). Aucun prêt → préparation en cours.
  const latestReady = reports.find((rep) => rep.status === "ready");
  let radar: RadarScore | null = null;
  if (latestReady) {
    try {
      const detail = await getReportDetail(latestReady.id);
      radar = detail.radar_score ? toRadarScore(detail.radar_score) : null;
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
    }
  }
  const overall = radar ? overallScore(radar) : null;
  const maturity = overall !== null ? maturityLevel(overall) : null;

  return (
    <div className="space-y-8">
      {/* Cas limite : porteur déjà actif qui aurait refait un diagnostic en anonyme. */}
      <ClaimPendingDiagnostic />

      {/* Confiance : confirme l'email (prioritaire sur le nudge d'onboarding). */}
      {!emailVerified && <EmailVerifyNudge />}

      {/* Profilage progressif : nudge doux si l'onboarding a été passé. */}
      {emailVerified && !session?.onboarding_completed && (
        <Link
          href={routes.onboarding}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2.5 text-sm transition-colors hover:bg-primary/10"
        >
          <span className="text-muted-foreground">{t("profileNudge")}</span>
          <span className="font-medium text-primary whitespace-nowrap">{t("profileNudgeCta")}</span>
        </Link>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {t("greeting", { name: firstName })}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary">{radar ? t("badgeDone") : t("badgePending")}</Badge>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.diagnostic}>
              <Plus className="size-3.5" />
              {t("newProject")}
            </Link>
          </Button>
        </div>
      </div>

      {radar && maturity ? (
        <>
          <Card>
            <CardContent className="grid items-center gap-6 pt-6 sm:grid-cols-[auto_1fr]">
              <div className="mx-auto">
                <RadarChart score={radar} size={240} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {t("compassEyebrow")}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="tabular font-display text-3xl font-extrabold">{overall}</span>
                  <span className="text-muted-foreground">/100</span>
                  <Badge variant={TONE_TO_BADGE[maturity.tone]}>
                    {tr(`maturity.${maturity.key}.label`)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tr(`maturity.${maturity.key}.description`)}
                </p>
                <Button asChild variant="ghost" size="sm" className="mt-1 -ml-2">
                  <Link href={routes.readiness}>
                    {t("readiness")}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold tracking-tight">
              {t("comprehensionTitle")}
            </h2>
            <ComprehensionTable score={radar} />
          </section>

          {/* Prochaines étapes — connecte la boussole au parcours (Workshop → Studio → Orbit). */}
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold tracking-tight">{t("nextTitle")}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <NextCard
                icon={GraduationCap}
                href={routes.academy}
                title={t("next.workshopTitle")}
                text={t("next.workshopText")}
              />
              <NextCard
                icon={Palette}
                href={routes.studio}
                title={t("next.studioTitle")}
                text={t("next.studioText")}
              />
              <NextCard
                icon={Compass}
                href={routes.opportunities}
                title={t("next.opportunitiesTitle")}
                text={t("next.opportunitiesText")}
              />
            </div>
          </section>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">{t("preparingTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("preparingText")}</p>
            </div>
            <Button asChild>
              <Link href={routes.bilan(reports[0].id)}>
                {t("seeProgress")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <ReportsList reports={reportCards} />
        <NotificationsList />
      </div>

      <DocumentsManager />
    </div>
  );
}

/** Carte d'action « prochaine étape » — mène vers un espace du parcours. */
function NextCard({
  icon: Icon,
  href,
  title,
  text,
}: {
  icon: React.ElementType;
  href: string;
  title: string;
  text: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-shadow hover:border-border-strong hover:shadow-sm">
        <CardContent className="flex h-full flex-col gap-2 pt-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          <h3 className="font-display font-bold">{title}</h3>
          <p className="flex-1 text-sm text-muted-foreground">{text}</p>
          <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Espace porteur sans diagnostic (état réel d'un compte frais). On ne montre pas de fausses
 * données : un accueil chaleureux et une seule action claire — lancer le diagnostic.
 */
async function EmptyDashboard({ firstName }: { firstName: string }) {
  const t = await getTranslations("Dashboard");
  const steps = [
    { icon: Compass, key: "understand", active: true },
    { icon: GraduationCap, key: "structure", active: false },
    { icon: Palette, key: "dress", active: false },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Rattache un diagnostic fait en anonyme (le « Garder mon bilan » du parcours public). */}
      <ClaimPendingDiagnostic />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t("greeting", { name: firstName })}
        </h1>
        <p className="text-muted-foreground">{t("empty.subtitle")}</p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="grid items-center gap-8 pt-6 sm:grid-cols-[auto_1fr]">
          {/* Aperçu de la boussole — estompé tant qu'il n'y a pas de diagnostic. */}
          <div className="relative mx-auto" aria-hidden>
            <div className="opacity-25 blur-[1px]">
              <RadarChart score={sampleScore} size={220} />
            </div>
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-xs font-medium text-muted-foreground">
              {t("empty.compassPlaceholder")}
            </span>
          </div>

          <div className="space-y-4">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-dawn text-ink">
              <Sparkles className="size-6" />
            </span>
            <div className="space-y-1">
              <h2 className="font-display text-xl font-bold tracking-tight">{t("empty.ctaTitle")}</h2>
              <p className="max-w-md text-muted-foreground">{t("empty.ctaText")}</p>
            </div>
            <Button asChild size="md">
              <Link href={routes.diagnostic}>
                {t("empty.ctaButton")}
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold tracking-tight">{t("empty.journeyTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ icon: Icon, key, active }) => (
            <Card key={key} className={active ? "" : "opacity-70"}>
              <CardContent className="space-y-2 pt-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                    <Icon className="size-5" />
                  </span>
                  <Badge variant={active ? "primary" : "outline"}>
                    {active ? t("empty.toStart") : t("empty.upcoming")}
                  </Badge>
                </div>
                <h3 className="font-display text-base font-bold">{t(`empty.steps.${key}.label`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`empty.steps.${key}.text`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
