import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { RefreshCw } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { ApiError } from "@/shared/api/client";
import { Button, Card, CardContent } from "@/shared/ui";
import { getReportDetail } from "@/features/reports/api";
import { BilanPending, BilanView, BilanFinalizing } from "@/features/reports";
import { getProjectEvaluation, type ProjectEvaluation } from "@/features/evaluation";

export const metadata: Metadata = { title: "Mon bilan" };

export default async function BilanPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;

  let report;
  try {
    report = await getReportDetail(reportId);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  // Radar explicable (détail par dimension) — best-effort : si l'endpoint n'est pas
  // disponible (branche audit non déployée, 403/404), on dégrade sans casser le bilan.
  let evaluation: ProjectEvaluation | null = null;
  if (report.radar_score) {
    evaluation = await getProjectEvaluation(report.project_id).catch(() => null);
  }

  // Découplage Radar / rapport : dès que le score est là (radar_score présent), on affiche
  // le bilan — même si le rapport détaillé + PDF (Phase 2) finalisent encore en arrière-plan.
  if (report.status === "ready") return <BilanView report={report} evaluation={evaluation} />;
  if (report.radar_score) {
    return (
      <div className="space-y-6">
        <BilanFinalizing reportId={reportId} />
        <BilanView report={report} evaluation={evaluation} />
      </div>
    );
  }
  if (report.status === "failed") {
    const t = await getTranslations("Bilan.failed");
    return (
      <Card>
        <CardContent className="space-y-3 py-12 text-center">
          <h2 className="font-display text-xl font-bold">{t("title")}</h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            {t("text")}
          </p>
          <Button asChild>
            <Link href={routes.diagnostic}>
              <RefreshCw className="size-4" />
              {t("cta")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <BilanPending reportId={reportId} />;
}
