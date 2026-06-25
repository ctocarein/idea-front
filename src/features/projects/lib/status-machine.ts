import type { ProjectStatus } from "../types/project.types";

/**
 * Miroir CLIENT de la machine à états (UX only — ARCHITECTURE_FRONTEND §13).
 * On n'affiche QUE les transitions légales depuis le statut courant ; le
 * backend reste le juge (un statut illégal → 422). « Le front propose, le
 * backend dispose. »
 */
export const STATUS_LABEL: Record<ProjectStatus, string> = {
  new_diagnostic: "Nouveau",
  in_review: "En analyse",
  needs_work: "À retravailler",
  qualified: "Qualifié",
  excellence: "Excellence",
  rejected: "Hors cible",
};

export const STATUS_VARIANT: Record<
  ProjectStatus,
  "neutral" | "primary" | "warning" | "success" | "danger" | "verified"
> = {
  new_diagnostic: "neutral",
  in_review: "primary",
  needs_work: "warning",
  qualified: "success",
  excellence: "verified",
  rejected: "danger",
};

const TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  new_diagnostic: ["in_review"],
  in_review: ["qualified", "needs_work", "rejected"],
  needs_work: ["in_review"],
  qualified: ["excellence", "needs_work"],
  excellence: ["qualified"],
  rejected: ["in_review"],
};

export function nextStatuses(current: ProjectStatus): ProjectStatus[] {
  return TRANSITIONS[current] ?? [];
}
