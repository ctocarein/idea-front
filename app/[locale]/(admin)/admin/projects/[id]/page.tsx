import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { ApiError } from "@/shared/api/client";
import { ProjectDetail, type TimelineEvent } from "@/features/projects";
import { getAdminProject, getAdminProjectTimeline } from "@/features/projects/api";
import { BilanEditor } from "@/features/reports";
import { getReportDetail } from "@/features/reports/api";
import { transitionText } from "@/features/audit/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const project = await getAdminProject(id);
    return { title: project.name };
  } catch {
    const t = await getTranslations("Admin.projects");
    return { title: t("fallbackTitle") };
  }
}

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let project;
  try {
    project = await getAdminProject(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  // Journal d'audit du projet. Mis en forme ici (Server Component) : les helpers d'audit
  // vivent avec le client HTTP server-only, on ne peut pas les faire descendre dans un
  // composant client. La fiche reste lisible même si la timeline échoue.
  const t = await getTranslations("Admin.audit");
  const locale = await getLocale();
  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let timeline: TimelineEvent[] = [];
  try {
    const logs = await getAdminProjectTimeline(id);
    timeline = logs.map((log) => ({
      label: t.has(`actions.${log.action.replaceAll(".", "_")}`)
        ? t(`actions.${log.action.replaceAll(".", "_")}`)
        : log.action,
      detail: transitionText(log),
      when: dateFmt.format(new Date(log.created_at)),
    }));
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  // Reprise humaine du bilan, ici plutôt que dans l'espace porteur : c'est l'analyste
  // assigné qu'elle vise, et le proxy lui interdit `/dashboard`. Le backend reste juge
  // (`guard_assigned_or_admin`) — un analyste non assigné se verra refuser l'écriture.
  let report = null;
  if (project.latestReportId) {
    report = await getReportDetail(project.latestReportId).catch(() => null);
  }

  return (
    <div className="space-y-6">
      <ProjectDetail project={project} timeline={timeline} />
      {report ? <BilanEditor report={report} /> : null}
    </div>
  );
}
