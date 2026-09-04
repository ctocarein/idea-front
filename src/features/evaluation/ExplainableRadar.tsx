import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowRight, HelpCircle, Info, Quote, Target } from "lucide-react";

import { Button, Card, CardContent } from "@/shared/ui";
import { AddMemory } from "@/features/projects";
import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { PILLARS, axesByKey, isActionableLever, nextAnchor, reachedAnchor } from "@/features/scoring";
import type { GridAxis } from "@/features/scoring/api";

import type { Contradiction, DimensionEvaluation, EvidenceState, ProjectEvaluation } from "./api";

/** Ce que le porteur (ou le système) a déjà déclaré sur une dimension. */
export interface MemoryStatement {
  id: string;
  statement: string;
}

/** État de preuve → style de pastille. Plus la preuve est solide, plus c'est « vert ». */
const EVIDENCE_STYLE: Record<EvidenceState, string> = {
  verified: "bg-success/15 text-success",
  supported: "bg-success/15 text-success",
  declared: "bg-primary/15 text-primary",
  inferred: "bg-warning/15 text-warning",
  stale: "bg-warning/15 text-warning",
  unknown: "bg-secondary text-muted-foreground",
};

/**
 * Radar explicable — le détail par dimension derrière le score.
 *
 * Le produit promet « où en est le projet ET ce qui lui manque ». « Viabilité : fragile »
 * ne dit pas ce qui manque ; « D6 Modèle économique 3/10 — aucun prix ni coût unitaire
 * identifié, et voici le palier suivant » le dit. D'où l'ouverture des 12 dimensions.
 *
 * Les piliers ne disparaissent pas : ils deviennent un REGROUPEMENT, pas un écran. Le
 * bilan s'ouvre sur les 4 piliers, chacun dépliable sur ses 3 dimensions, chiffrées et
 * ancrées (SPEC_SCORING_INTEGRITY C6).
 *
 * Rien n'est recalculé ici : le score est figé dans le `ScoreRun`, les ancres viennent de
 * la grille qui l'a produit. Deux consultations du même rapport montrent le même chiffre.
 */
export function ExplainableRadar({
  evaluation,
  memory,
  gridAxes,
}: {
  evaluation: ProjectEvaluation;
  /** Mémoire projet par dimension (`d1`…`d12`) — ce qui fonde l'état de preuve. */
  memory?: Record<string, MemoryStatement[]>;
  /** Axes de la grille servie (`GET /scoring/grid`) : ancres et leviers. */
  gridAxes?: readonly GridAxis[];
}) {
  const t = useTranslations("Bilan.evaluation");
  const dims = evaluation.dimensions ?? [];
  const questions = (evaluation.questions ?? []).slice(0, 3);
  const axes = axesByKey(gridAxes);

  if (dims.length === 0) return null;

  // Regroupement par pilier, dans l'ordre de la grille. Une dimension dont le pilier est
  // inconnu n'est jamais perdue : elle atterrit dans un groupe de fin.
  const known = new Set(PILLARS.map((p) => p.key as string));
  const groups: { key: string; label: string; question?: string; dims: DimensionEvaluation[] }[] = [
    ...PILLARS.map((p) => ({
      key: p.key as string,
      label: p.label as string,
      question: p.question as string,
      dims: dims.filter((d) => d.pillar === p.key),
    })),
    { key: "_autres", label: t("otherPillar"), dims: dims.filter((d) => !known.has(d.pillar)) },
  ].filter((g) => g.dims.length > 0);

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-display text-lg font-bold tracking-tight">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* L'ouverture du détail rend l'instabilité du score visible : autant l'assumer et
          dire qu'il est en attente de revue, plutôt que de le présenter comme définitif. */}
      {evaluation.needs_review ? (
        <p className="flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>{t("needsReview")}</span>
        </p>
      ) : null}

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.key} className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h3 className="font-display text-base font-bold tracking-tight">{group.label}</h3>
              {group.question ? (
                <p className="text-xs text-muted-foreground">{group.question}</p>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.dims.map((dim) => (
                <DimensionCard
                  key={dim.dimension}
                  dim={dim}
                  axis={axes[dim.dimension]}
                  t={t}
                  projectId={evaluation.project_id}
                  statements={memory?.[dim.dimension] ?? []}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {questions.length > 0 && (
        <Card>
          <CardContent className="space-y-3 pt-5">
            <h3 className="flex items-center gap-2 font-display text-base font-bold">
              <HelpCircle className="size-5 text-primary" />
              {t("questionsTitle")}
            </h3>
            <ul className="space-y-3">
              {questions.map((q, i) => (
                <li key={i} className="space-y-0.5">
                  <p className="text-sm font-medium">{q.question}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.label}
                    {q.reason ? ` · ${q.reason}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function DimensionCard({
  dim,
  axis,
  t,
  projectId,
  statements,
}: {
  dim: DimensionEvaluation;
  /** Définition de la dimension dans la grille servie : ancres, levier. */
  axis?: GridAxis;
  t: ReturnType<typeof useTranslations>;
  projectId: string;
  statements: MemoryStatement[];
}) {
  const confidencePct = Math.round((dim.confidence ?? 0) * 100);
  const reached = reachedAnchor(axis, dim.score);
  const next = nextAnchor(axis, dim.score);
  // Le CTA n'apparaît que si le levier mène quelque part. Les autres dimensions montrent
  // l'écart au palier suivant sans bouton — un objectif clair vaut mieux qu'un lien mort.
  const leverType = (dim.next_action as { lever_type?: string } | undefined)?.lever_type;
  const actionable = isActionableLever(leverType);
  const evidenceLabel = t.has(`evidence.${dim.evidence_state}`)
    ? t(`evidence.${dim.evidence_state}`)
    : dim.evidence_state;
  const contradictions = dim.contradictions ?? [];
  const contradicted = contradictions.length > 0;

  return (
    <Card className={contradicted ? "border-coral-strong/40" : undefined}>
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">
              {dim.code ? <span className="text-muted-foreground">{dim.code} · </span> : null}
              {dim.label}
            </p>
            {/* L'ancre ATTEINTE, pas le pilier : le pilier est déjà le titre du groupe, et
                le porteur a besoin de savoir ce que son chiffre VEUT DIRE. */}
            {reached ? (
              <p className="text-xs text-muted-foreground">{reached.label}</p>
            ) : null}
          </div>
          <span className="shrink-0 font-display text-lg font-bold tabular-nums">
            {dim.score === null ? "—" : `${dim.score}/10`}
          </span>
        </div>

        {/* Confiance + état de preuve */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("confidence", { pct: confidencePct })}</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${EVIDENCE_STYLE[dim.evidence_state] ?? EVIDENCE_STYLE.unknown}`}
            >
              {evidenceLabel}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${confidencePct}%` }} />
          </div>
        </div>

        {dim.rationale && <p className="text-sm text-muted-foreground">{dim.rationale}</p>}

        {/* L'écart au palier suivant — « ce qui lui manque », littéralement. Absent quand
            la dimension est déjà au plus haut : il n'y a alors rien à viser. */}
        {next ? (
          <div className="space-y-2 rounded-lg bg-secondary/60 px-2.5 py-2">
            <p className="flex items-start gap-1.5 text-xs">
              <Target className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <span>
                <span className="font-medium">{t("nextAnchor", { score: next.min })}</span>{" "}
                <span className="text-muted-foreground">{next.label}</span>
              </span>
            </p>
            {actionable ? (
              <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                <Link href={leverType === "mentor" ? routes.mentors : routes.dashboard}>
                  {t(`lever.${leverType}`)}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            ) : null}
          </div>
        ) : null}

        {dim.missing_information && (
          <p className="flex items-start gap-1.5 rounded-lg bg-warning/10 px-2.5 py-2 text-xs text-warning">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            <span>{dim.missing_information}</span>
          </p>
        )}

        {contradicted && (
          <div className="space-y-2 rounded-lg bg-coral/10 px-2.5 py-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-coral-strong">
              <AlertTriangle className="size-3.5 shrink-0" />
              {t("contradictionTitle")}
            </p>
            {contradictions.map((c) => (
              <ContradictionBlock key={c.id} contradiction={c} t={t} />
            ))}
          </div>
        )}

        {/* Mémoire projet : ce qui est déjà déclaré, et de quoi en ajouter. C'est le
            seul endroit où le porteur peut répondre à « il me manque cette information ». */}
        {statements.length > 0 && (
          <ul className="space-y-1.5 border-t border-border pt-3">
            {statements.map((item) => (
              <li key={item.id} className="flex gap-1.5 text-xs text-muted-foreground">
                <Quote className="mt-0.5 size-3 shrink-0" />
                <span>{item.statement}</span>
              </li>
            ))}
          </ul>
        )}
        <AddMemory projectId={projectId} dimension={dim.dimension} />
      </CardContent>
    </Card>
  );
}

function ContradictionBlock({
  contradiction,
  t,
}: {
  contradiction: Contradiction;
  t: ReturnType<typeof useTranslations>;
}) {
  const { statement, quote_a, quote_b } = contradiction;
  return (
    <div className="space-y-1.5 text-xs">
      {statement && <p className="text-foreground/80">{statement}</p>}
      {quote_a && quote_b && (
        <div className="flex flex-col gap-1">
          <span className="rounded bg-card px-2 py-1 italic text-muted-foreground">“{quote_a}”</span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-coral-strong">
            {t("contradictionVs")}
          </span>
          <span className="rounded bg-card px-2 py-1 italic text-muted-foreground">“{quote_b}”</span>
        </div>
      )}
    </div>
  );
}
