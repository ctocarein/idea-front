import { Badge } from "@/shared/ui";
import { STATUS_LABEL, STATUS_VARIANT } from "../lib/status-machine";
import type { ProjectStatus } from "../types/project.types";

/** Mappe un statut métier → libellé + couleur, et délègue au Badge générique. */
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
