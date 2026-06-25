import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, GraduationCap, Mic, Sparkles } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { getSession } from "@/shared/auth/server";
import { ApiError } from "@/shared/api/client";
import { Badge, Button, Card, CardContent } from "@/shared/ui";
import {
  ComprehensionTable,
  RadarChart,
  overallScore,
  reading,
  sampleScore,
} from "@/features/scoring";
import { AcademyProgress } from "@/features/academy";
import { PitchProgress } from "@/features/pitch-simulator";
import { ReportsList } from "@/features/reports";
import { getMyReports, getReportDetail, toRadarScore, toReportCard } from "@/features/reports/api";
import type { RadarScore } from "@/features/scoring";
import { NotificationsList } from "@/features/notifications";
import { DocumentsManager } from "@/features/documents";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const session = await getSession();
  const firstName = session?.name.split(" ")[0] ?? "porteur";

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
  const r = overall !== null ? reading(overall) : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-muted-foreground">
            Voici où en est ton projet aujourd&apos;hui.
          </p>
        </div>
        <Badge variant="primary">{radar ? "Diagnostic fait" : "Analyse en cours"}</Badge>
      </div>

      {radar && r ? (
        <>
          <Card>
            <CardContent className="grid items-center gap-6 pt-6 sm:grid-cols-[auto_1fr]">
              <div className="mx-auto">
                <RadarChart score={radar} size={240} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Ta boussole
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="tabular font-display text-3xl font-extrabold">{overall}</span>
                  <span className="text-muted-foreground">/100</span>
                  <Badge variant="success">{r.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Le Radar de Collision résume tes axes. Tu le verras progresser au fil de
                  l&apos;Academy et du simulateur.
                </p>
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
      ) : (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">
                Ton bilan se prépare
              </h2>
              <p className="text-sm text-muted-foreground">
                L&apos;analyse de ton projet est en cours. Tu peux suivre son avancement.
              </p>
            </div>
            <Button asChild>
              <Link href={routes.bilan(reports[0].id)}>
                Voir l&apos;avancement
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <AcademyProgress />
        <PitchProgress />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ReportsList reports={reportCards} />
        <NotificationsList />
      </div>

      <DocumentsManager />
    </div>
  );
}

/**
 * Espace porteur sans diagnostic (état réel d'un compte frais). On ne montre pas de fausses
 * données : un accueil chaleureux (charte §1.1) et une seule action claire — lancer le diagnostic.
 */
function EmptyDashboard({ firstName }: { firstName: string }) {
  const steps = [
    {
      icon: Compass,
      label: "Comprendre",
      text: "Un diagnostic produit ta boussole : forces et angles morts.",
      active: true,
    },
    {
      icon: GraduationCap,
      label: "Apprendre",
      text: "L'Academy t'explique le BP, le modèle éco, le pitch — et tu construis ta version.",
      active: false,
    },
    {
      icon: Mic,
      label: "S'exercer",
      text: "Le simulateur te fait affronter les vraies questions, autant que tu veux.",
      active: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Bonjour, {firstName} 👋
        </h1>
        <p className="text-muted-foreground">
          Bienvenue dans ton espace. On part d&apos;où tu es.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="grid items-center gap-8 pt-6 sm:grid-cols-[auto_1fr]">
          {/* Aperçu de la boussole — estompé tant qu'il n'y a pas de diagnostic. */}
          <div className="relative mx-auto" aria-hidden>
            <div className="opacity-25 blur-[1px]">
              <RadarChart score={sampleScore} size={220} />
            </div>
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-xs font-medium text-muted-foreground">
              Ta boussole
              <br />
              apparaîtra ici
            </span>
          </div>

          <div className="space-y-4">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-dawn text-ink">
              <Sparkles className="size-6" />
            </span>
            <div className="space-y-1">
              <h2 className="font-display text-xl font-bold tracking-tight">
                Lance ton premier diagnostic
              </h2>
              <p className="max-w-md text-muted-foreground">
                En quelques minutes, obtiens ton tableau de compréhension — essence, viabilité,
                scalabilité. Gratuit, sans jugement.
              </p>
            </div>
            <Button asChild size="md">
              <Link href={routes.diagnostic}>
                Commencer mon diagnostic
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold tracking-tight">Ton parcours</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ icon: Icon, label, text, active }) => (
            <Card key={label} className={active ? "" : "opacity-70"}>
              <CardContent className="space-y-2 pt-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                    <Icon className="size-5" />
                  </span>
                  {active ? (
                    <Badge variant="primary">À commencer</Badge>
                  ) : (
                    <Badge variant="outline">À venir</Badge>
                  )}
                </div>
                <h3 className="font-display text-base font-bold">{label}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
