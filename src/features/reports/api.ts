import { ApiError, apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";
import type { RadarScore } from "@/features/scoring";

import type { Report } from "./index";

/**
 * Données réelles des bilans (Sprint INT). Le porteur voit ses bilans (`GET /reports`) ;
 * le score Radar vit dans le détail (`GET /reports/{id}`).
 */
type ReportOut = components["schemas"]["ReportOut"];
export type ReportDetail = components["schemas"]["ReportDetailOut"];

/** Liste des bilans du porteur connecté (vide tant qu'aucun diagnostic n'a été lancé). */
export async function getMyReports(): Promise<ReportOut[]> {
  return apiFetch<ReportOut[]>("/api/v1/reports");
}

/** Détail d'un bilan : score Radar v2 + tableau de compréhension + rapport structuré. */
export async function getReportDetail(reportId: string): Promise<ReportDetail> {
  return apiFetch<ReportDetail>(`/api/v1/reports/${reportId}`);
}

/** Le projet du porteur (dérivé de ses bilans), ou `null` s'il n'a pas encore de diagnostic. */
export async function getMyProjectId(): Promise<string | null> {
  try {
    const reports = await getMyReports();
    return reports[0]?.project_id ?? null;
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return null;
  }
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Score Radar v2 du dernier bilan prêt du porteur, ou `null` (aucun diagnostic / réseau KO). */
export async function getLatestRadar(): Promise<RadarScore | null> {
  let reports: ReportOut[] = [];
  try {
    reports = await getMyReports();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return null;
  }
  const latestReady = reports.find((report) => report.status === "ready");
  if (!latestReady) return null;
  try {
    const detail = await getReportDetail(latestReady.id);
    return detail.radar_score ? toRadarScore(detail.radar_score) : null;
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return null;
  }
}

/** Adapte le `radar_score` backend (clés d1-d12 /10) au type front. Les clés correspondent déjà. */
export function toRadarScore(
  radar: NonNullable<ReportDetail["radar_score"]>,
): RadarScore {
  return { gridVersion: radar.gridVersion, axes: radar.axes as RadarScore["axes"] };
}

/** Adapte un bilan backend à la carte d'affichage (`ReportsList`). */
export function toReportCard(report: ReportOut): Report {
  return {
    id: report.id,
    title: report.title,
    status: report.status === "ready" ? "ready" : "pending",
    createdAt: dateFmt.format(new Date(report.created_at)),
  };
}
