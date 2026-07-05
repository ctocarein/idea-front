import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ApiError } from "@/shared/api/client";
import { ProjectTable } from "@/features/projects";
import { getAdminProjects } from "@/features/projects/api";

export const metadata: Metadata = { title: "Projets" };

export default async function AdminProjectsPage() {
  const t = await getTranslations("Admin.projects");
  let projects: Awaited<ReturnType<typeof getAdminProjects>> = [];
  try {
    projects = await getAdminProjects();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>
      <ProjectTable projects={projects} />
    </div>
  );
}
