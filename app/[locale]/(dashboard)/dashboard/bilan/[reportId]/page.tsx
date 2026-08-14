import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { RefreshCw } from "lucide-react";

import { ApiError } from "@/shared/api/client";
import { getSession } from "@/shared/auth/server";
import { can } from "@/shared/auth";
import { Card, CardContent } from "@/shared/ui";
import { getReportDetail } from "@/features/reports/api";
import { BilanEditor, BilanPending, BilanView, BilanFinalizing } from "@/features/reports";
import {
  getProjectEvaluation,
  type MemoryStatement,
  type ProjectEvaluation,
} from "@/features/evaluation";
import { getProjectMemory } from "@/features/projects/api";
import { NewDiagnosticModal } from "@/features/diagnostics";

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

  // Radar explicable (détail par dimension) + mémoire projet qui le fonde — best-effort :
  // si l'un des deux endpoints manque (403/404), on dégrade sans casser le bilan.
  let evaluation: ProjectEvaluation | null = null;
  let memory: Record<string, MemoryStatement[]> = {};
  if (report.radar_score) {
    const [evalResult, memoryItems] = await Promise.all([
      getProjectEvaluation(report.project_id).catch(() => null),
      getProjectMemory(report.project_id).catch(() => []),
    ]);
    evaluation = evalResult;
    memory = memoryItems.reduce<Record<string, MemoryStatement[]>>((acc, item) => {
      (acc[item.dimension] ??= []).push({ id: item.id, statement: item.statement });
      return acc;
    }, {});
  }

  // Reprise humaine : affordance réservée aux rôles qui peuvent réellement l'exercer
  // (le backend reste la barrière — `guard_assigned_or_admin`). Le porteur ne la voit pas.
  const session = await getSession();
  const editor = can(session, "project.changeStatus") ? <BilanEditor report={report} /> : null;

  // Découplage Radar / rapport : dès que le score est là (radar_score présent), on affiche
  // le bilan — même si le rapport détaillé + PDF (Phase 2) finalisent encore en arrière-plan.
  if (report.status === "ready") {
    return (
      <div className="space-y-6">
        {editor}
        <BilanView report={report} evaluation={evaluation} memory={memory} />
      </div>
    );
  }
  if (report.radar_score) {
    return (
      <div className="space-y-6">
        <BilanFinalizing reportId={reportId} />
        {editor}
        <BilanView report={report} evaluation={evaluation} memory={memory} />
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
          <NewDiagnosticModal>
            <RefreshCw className="size-4" />
            {t("cta")}
          </NewDiagnosticModal>
        </CardContent>
      </Card>
    );
  }

  return <BilanPending reportId={reportId} />;
}
