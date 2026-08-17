import { ArrowRight, FolderOpen } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { Badge, Card, CardContent } from "@/shared/ui";
import { sectorLabel } from "@/features/diagnostics";

import type { OwnerProject } from "../api";

/**
 * « Mes projets » — la liste des projets du porteur connecté (`GET /projects`).
 *
 * Chaque diagnostic lancé depuis l'espace crée un NOUVEAU projet (`POST /diagnostics` →
 * projet + bilan). Sans cette liste, un porteur qui ajoute une idée ne voyait apparaître
 * qu'un bilan de plus, sans jamais voir ses projets : on rend ici la collection visible.
 *
 * L'état affiché est celui que le porteur comprend — l'avancement de SON bilan — et non
 * le `review_status` de pilotage interne, qui appartient au back-office.
 */

/** Le minimum dont la liste a besoin d'un bilan pour rattacher un projet à son avancement. */
export interface ProjectReportRef {
  id: string;
  project_id: string;
  status: string;
  created_at: string;
}

export async function MyProjects({
  projects,
  reports = [],
}: {
  projects: OwnerProject[];
  reports?: ProjectReportRef[];
}) {
  const t = await getTranslations("Dashboard.projects");
  const locale = await getLocale();
  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (projects.length === 0) return null;

  // Le bilan le plus récent de chaque projet : c'est lui que la ligne ouvre.
  const latestByProject = new Map<string, ProjectReportRef>();
  for (const report of reports) {
    const known = latestByProject.get(report.project_id);
    if (!known || new Date(report.created_at) > new Date(known.created_at)) {
      latestByProject.set(report.project_id, report);
    }
  }

  // Le dernier projet ajouté en tête : c'est celui que le porteur vient de créer.
  const ordered = [...projects].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-bold tracking-tight">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("count", { count: projects.length })}</p>
      </div>

      <Card>
        <CardContent className="pt-2">
          <ul className="divide-y divide-border">
            {ordered.map((project) => {
              const latest = latestByProject.get(project.id);
              const state = !latest ? "none" : latest.status === "ready" ? "ready" : "pending";

              return (
                <li key={project.id}>
                  <Link
                    href={routes.project(project.id)}
                    className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-secondary/40"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                      <FolderOpen className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{project.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {sectorLabel(project.sector)} ·{" "}
                        {dateFmt.format(new Date(project.created_at))}
                      </p>
                    </div>
                    {state === "ready" && <Badge variant="success">{t("state.ready")}</Badge>}
                    {state === "pending" && <Badge variant="warning">{t("state.pending")}</Badge>}
                    {state === "none" && <Badge variant="neutral">{t("state.none")}</Badge>}
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
