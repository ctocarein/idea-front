import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, Brain, FileText, Layers } from "lucide-react";

import { ApiError } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { Link } from "@/i18n/navigation";
import { Badge, Button, Card, CardContent } from "@/shared/ui";
import {
  AXES,
  ComprehensionTable,
  RadarChart,
  TONE_TO_BADGE,
  maturityLevel,
} from "@/features/scoring";
import { getMaturityLevels } from "@/features/scoring/api";
import { toWorkspaceRadar } from "@/features/projects";
import { getProjectWorkspace } from "@/features/projects/api";
import { sectorLabel } from "@/features/diagnostics";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const workspace = await getProjectWorkspace(id);
    return { title: workspace.project.title };
  } catch {
    const t = await getTranslations("Project");
    return { title: t("fallbackTitle") };
  }
}

/** `d3` → « Proposition de valeur ». Une dimension inconnue reste affichée telle quelle. */
const AXIS_LABEL = new Map<string, string>(AXES.map((axis) => [axis.key, axis.label]));

/**
 * Espace projet du porteur (`GET /projects/{id}/workspace`).
 *
 * Le pendant de « Mes projets » : ce que le système sait de CE projet — sa boussole,
 * ses documents, sa mémoire. La reprise du bilan (`/dashboard/bilan/{id}`) reste la
 * lecture détaillée ; cette page est le point d'entrée du projet.
 */
export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("Project");
  const tr = await getTranslations("Radar");
  const te = await getTranslations("Bilan.evaluation");
  const locale = await getLocale();
  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let workspace;
  try {
    workspace = await getProjectWorkspace(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  const { project, latest_report: latest, documents, memory } = workspace;
  const radar = toWorkspaceRadar(latest?.radar_score);
  // Le global est SERVI, jamais recalculé : moyenne pondérée par secteur, que le front ne
  // peut pas reproduire faute d'avoir les poids. Les paliers viennent de la même grille —
  // une seule définition dans le système. Best-effort : sans grille, le palier est absent.
  const overall = radar?.overall ?? null;
  const levels = radar ? await getMaturityLevels().catch(() => []) : [];
  const maturity = overall !== null ? maturityLevel(overall, levels) : null;
  const state = !latest ? "none" : latest.status === "ready" ? "ready" : "pending";

  const stats = [
    { key: "documents", icon: FileText, value: `${documents.confirmed}/${documents.total}` },
    { key: "memory", icon: Brain, value: String(memory.total_active) },
    { key: "dimensions", icon: Layers, value: `${Object.keys(memory.by_dimension).length}/12` },
  ] as const;

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={routes.dashboard}>
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight">{project.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t("meta", {
              sector: sectorLabel(project.sector),
              stage: project.stage,
              date: dateFmt.format(new Date(project.created_at)),
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {state === "ready" && <Badge variant="success">{t("state.ready")}</Badge>}
          {state === "pending" && <Badge variant="warning">{t("state.pending")}</Badge>}
          {state === "none" && <Badge variant="neutral">{t("state.none")}</Badge>}
          {latest && (
            <Button asChild size="sm" variant="outline">
              <Link href={routes.bilan(latest.id)}>
                {t("openReport")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {radar && maturity ? (
        <>
          <Card>
            <CardContent className="grid items-center gap-6 pt-6 sm:grid-cols-[auto_1fr]">
              <div className="mx-auto">
                <RadarChart score={radar} size={220} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {t("compassEyebrow")}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="tabular font-display text-3xl font-extrabold">{overall}</span>
                  <span className="text-muted-foreground">/100</span>
                  <Badge variant={TONE_TO_BADGE[maturity.tone]}>
                    {tr(`maturity.${maturity.key}.label`)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tr(`maturity.${maturity.key}.description`)}
                </p>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold tracking-tight">
              {t("comprehensionTitle")}
            </h2>
            <ComprehensionTable score={radar} />
          </section>
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {state === "none" ? t("noReport") : t("reportPending")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Ce que le système tient sur ce projet — la matière qui fonde le score. */}
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ key, icon: Icon, value }) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-3 pt-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="tabular font-display text-xl font-bold">{value}</p>
                <p className="truncate text-xs text-muted-foreground">{t(`stats.${key}`)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold tracking-tight">{t("memoryTitle")}</h2>
        <Card>
          <CardContent className="pt-2">
            {memory.recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("memoryEmpty")}</p>
            ) : (
              <ul className="divide-y divide-border">
                {memory.recent.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 py-3">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-xs font-medium text-muted-foreground">
                        {AXIS_LABEL.get(item.dimension) ?? item.dimension}
                      </p>
                      <p className="text-sm">{item.statement}</p>
                    </div>
                    <Badge variant="outline">
                      {te.has(`evidence.${item.evidence_state}`)
                        ? te(`evidence.${item.evidence_state}`)
                        : item.evidence_state}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
