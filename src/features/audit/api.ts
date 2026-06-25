import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

/**
 * Journal d'audit (admin/analyste, Sprint INT). Chaque action sensible est tracée —
 * pouvoir = traçabilité. `GET /admin/audit-logs`.
 */
export type AuditLog = components["schemas"]["AuditLogOut"];

export async function getAuditLogs(): Promise<AuditLog[]> {
  return apiFetch<AuditLog[]>("/api/v1/admin/audit-logs");
}

/** Libellés lisibles des actions tracées (fallback : le code brut). */
const ACTION_LABEL: Record<string, string> = {
  "project.review_status": "a fait évoluer le statut",
  "project.assignee": "a (ré)assigné",
  "mentor.application.approved": "a approuvé la candidature mentor",
  "mentor.application.rejected": "a rejeté la candidature mentor",
  "mentor.activated": "a activé le mentor",
  "mentor.suspended": "a suspendu le mentor",
  "scoring.grid.activated": "a activé la grille",
  "diagnostic.created": "a lancé un diagnostic",
};

export function actionLabel(action: string): string {
  return ACTION_LABEL[action] ?? action;
}

/** Extrait une valeur lisible d'un champ old/new (souvent `{value: "..."}`). */
function readValue(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && "value" in (v as Record<string, unknown>)) {
    return String((v as Record<string, unknown>).value);
  }
  return null;
}

/** Transition « avant → après » si disponible. */
export function transitionText(log: AuditLog): string | null {
  const before = readValue(log.old_value);
  const after = readValue(log.new_value);
  if (before && after) return `${before} → ${after}`;
  return after ?? before;
}
