import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

import type { Project, ProjectStatus } from "./types/project.types";

/**
 * Back-office projets (admin/analyste, Sprint INT). La liste porte les métadonnées de pilotage ;
 * le score Radar vit dans le bilan (détail), il n'est donc pas présent ici.
 */
type ProjectAdminOut = components["schemas"]["ProjectAdminOut"];

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function toProject(row: ProjectAdminOut): Project {
  return {
    id: row.id,
    name: row.title,
    founderName: "", // la liste ne porte que owner_id (résolu dans le détail)
    sector: row.sector,
    category: row.sector,
    archetype: row.archetype === "field" ? "terrain" : "digital",
    status: row.review_status as ProjectStatus,
    createdAt: dateFmt.format(new Date(row.created_at)),
    assignee: row.assignee_id ?? null,
    score: null,
  };
}

export async function getAdminProjects(): Promise<Project[]> {
  const rows = await apiFetch<ProjectAdminOut[]>("/api/v1/admin/projects");
  return rows.map(toProject);
}

export async function getAdminProject(projectId: string): Promise<Project> {
  const row = await apiFetch<ProjectAdminOut>(`/api/v1/admin/projects/${projectId}`);
  return toProject(row);
}
