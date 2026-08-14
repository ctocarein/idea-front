import type { Metadata } from "next";
import { ArrowRight, Compass, GraduationCap, Palette, Plus } from "lucide-react";
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
  type RadarScore,
} from "@/features/scoring";
import { ClaimPendingDiagnostic, NewDiagnosticModal } from "@/features/diagnostics";
import { ReportsList } from "@/features/reports";
import { getMyReports, getReportDetail, toRadarScore, toReportCard } from "@/features/reports/api";
import { NotificationsList } from "@/features/notifications";
import { DocumentsManager } from "@/features/documents";
import { NextCard } from "./_NextCard";
import { EmptyDashboard } from "./_EmptyDashboard";

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
      {/* Filet : un récit stashé non terminé (relecture interrompue) ramène le porteur au wizard. */}
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
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t("greeting", { name: firstName })}
        </h1>
        <div className="flex items-center gap-2">
          <Badge variant="primary">{radar ? t("badgeDone") : t("badgePending")}</Badge>
          <NewDiagnosticModal variant="outline" size="sm">
            <Plus className="size-3.5" />
            {t("newProject")}
          </NewDiagnosticModal>
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
