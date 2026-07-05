import { useTranslations } from "next-intl";

import { Badge } from "@/shared/ui";
import { STATUS_VARIANT } from "../lib/status-machine";
import type { ProjectStatus } from "../types/project.types";

/** Mappe un statut métier → libellé (i18n) + couleur, et délègue au Badge générique. */
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const t = useTranslations("Admin.projects.status");
  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>;
}
