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

/** La fiche porte en plus le dernier bilan : c'est lui que l'analyste assigné reprend. */
export interface AdminProjectDetail extends Project {
  latestReportId: string | null;
}

export async function getAdminProject(projectId: string): Promise<AdminProjectDetail> {
  const row = await apiFetch<components["schemas"]["ProjectAdminDetailOut"]>(
    `/api/v1/admin/projects/${projectId}`,
  );
  return { ...toProject(row), latestReportId: row.latest_report_id ?? null };
}

/* ---------------------------------------------------------------------------
 * Espace projet côté PORTEUR (`/projects/*`) — distinct du back-office ci-dessus.
 * ------------------------------------------------------------------------- */

export type OwnerProject = components["schemas"]["OwnerProjectOut"];
export type ProjectWorkspace = components["schemas"]["ProjectWorkspaceOut"];
export type ProjectMemoryItem = components["schemas"]["ProjectMemoryItemOut"];

/** Les projets du porteur connecté — `GET /projects`. */
export async function getMyProjects(): Promise<OwnerProject[]> {
  return apiFetch<OwnerProject[]>("/api/v1/projects");
}

/** Vue agrégée d'un projet (dernier bilan, documents, mémoire) — `GET /projects/{id}/workspace`. */
export async function getProjectWorkspace(projectId: string): Promise<ProjectWorkspace> {
  return apiFetch<ProjectWorkspace>(`/api/v1/projects/${projectId}/workspace`);
}

/**
 * Mémoire projet — `GET /projects/{id}/memory`. Ce que le système sait du projet, pièce
 * par pièce : c'est cette matière qui détermine l'`evidence_state` du radar explicable.
 */
export async function getProjectMemory(
  projectId: string,
  options: { dimension?: string; activeOnly?: boolean; limit?: number } = {},
): Promise<ProjectMemoryItem[]> {
  const qs = new URLSearchParams();
  if (options.dimension) qs.set("dimension", options.dimension);
  if (options.activeOnly === false) qs.set("active_only", "false");
  if (options.limit) qs.set("limit", String(options.limit));
  const suffix = qs.size > 0 ? `?${qs.toString()}` : "";
  return apiFetch<ProjectMemoryItem[]>(`/api/v1/projects/${projectId}/memory${suffix}`);
}

/** Journal d'audit du projet — `GET /admin/projects/{id}/timeline`. L'historique réel, pas reconstitué. */
export async function getAdminProjectTimeline(
  projectId: string,
): Promise<components["schemas"]["AuditLogOut"][]> {
  return apiFetch<components["schemas"]["AuditLogOut"][]>(
    `/api/v1/admin/projects/${projectId}/timeline`,
  );
}
