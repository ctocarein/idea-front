import type { Metadata } from "next";

import { ApiError } from "@/shared/api/client";
import { ProjectTable } from "@/features/projects";
import { getAdminProjects } from "@/features/projects/api";

export const metadata: Metadata = { title: "Projets" };

export default async function AdminProjectsPage() {
  let projects: Awaited<ReturnType<typeof getAdminProjects>> = [];
  try {
    projects = await getAdminProjects();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Projets</h1>
        <p className="text-muted-foreground">
          Filtre, trie et pilote le cycle de vie des projets.
        </p>
      </div>
      <ProjectTable projects={projects} />
    </div>
  );
}
