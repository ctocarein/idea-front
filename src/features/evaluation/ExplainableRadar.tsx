import { useTranslations } from "next-intl";
import { AlertTriangle, HelpCircle, Info, Quote } from "lucide-react";

import { Card, CardContent } from "@/shared/ui";
import { AddMemory } from "@/features/projects";

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
 * Radar explicable — le détail par dimension derrière le score : confiance, état de
 * preuve, justification, information manquante. Rend le score lisible et actionnable.
 * (Les contradictions du détecteur seront ajoutées ici une fois l'audit branché en flux.)
 */
export function ExplainableRadar({
  evaluation,
  memory,
}: {
  evaluation: ProjectEvaluation;
  /** Mémoire projet par dimension (`d1`…`d12`) — ce qui fonde l'état de preuve. */
  memory?: Record<string, MemoryStatement[]>;
}) {
  const t = useTranslations("Bilan.evaluation");
  const dims = evaluation.dimensions ?? [];
  const questions = (evaluation.questions ?? []).slice(0, 3);

  if (dims.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-display text-lg font-bold tracking-tight">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {dims.map((dim) => (
          <DimensionCard
            key={dim.dimension}
            dim={dim}
            t={t}
            projectId={evaluation.project_id}
            statements={memory?.[dim.dimension] ?? []}
          />
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
  t,
  projectId,
  statements,
}: {
  dim: DimensionEvaluation;
  t: ReturnType<typeof useTranslations>;
  projectId: string;
  statements: MemoryStatement[];
}) {
  const confidencePct = Math.round((dim.confidence ?? 0) * 100);
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
            <p className="truncate font-medium">{dim.label}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{dim.pillar}</p>
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
