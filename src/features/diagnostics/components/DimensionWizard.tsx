"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check, HelpCircle, Pencil, Sparkles } from "lucide-react";

import { Button, Textarea } from "@/shared/ui";
import { AXES } from "@/features/scoring";
import type { ExtractedDimension, IdeaExtract } from "../api/actions";

/** Ce que le porteur a décidé pour une dimension. */
export type DimensionVerdict = "confirmed" | "adjusted" | "skipped";

export interface WizardResult {
  /** Le texte retenu par dimension (les « pas encore » n'y figurent pas). */
  answers: Record<string, string>;
  /** Validées telles que l'IA les avait écrites. */
  confirmed: string[];
  /** Réécrites par le porteur. */
  adjusted: string[];
  /** Laissées de côté — elles alimenteront le Workshop. */
  skipped: string[];
}

/** Couleur de pilier — même mapping que les cartes du Workshop, pour que ça se reconnaisse. */
const PILLAR_COLOR: Record<string, string> = {
  sens: "text-coral-strong",
  viabilite: "text-amber-500",
  scalabilite: "text-blue-500",
  execution: "text-violet-500",
};

const PILLAR_BY_KEY: Record<string, string> = Object.fromEntries(
  AXES.map((a) => [a.key, a.pillar]),
);

function initialDraft(d: ExtractedDimension): string {
  return (d.suggestion || d.evidence || "").trim();
}

/**
 * Le wizard de relecture — écran 03 du flow porteur.
 *
 * L'IA a déjà rédigé les 12 dimensions à partir du récit ; le porteur ne produit pas, il
 * **tranche** : c'est juste · j'ajuste · pas encore. Une dimension non tranchée par un humain
 * reste provisoire, et c'est ce qui plafonne le projet.
 *
 * Remplace l'ancienne étape `fill`, qui ne parcourait que les trous (`extract.gaps`) et
 * laissait les dimensions captées invisibles — donc jamais confirmées par personne.
 */
export function DimensionWizard({
  extract,
  onComplete,
  onExit,
  submitting = false,
  submitLabel,
}: {
  extract: IdeaExtract;
  onComplete: (result: WizardResult) => void;
  /** « Reprendre plus tard » — absent si le parcours ne permet pas de sortir. */
  onExit?: () => void;
  submitting?: boolean;
  /** Libellé du CTA final (par défaut : lancer l'analyse). */
  submitLabel?: string;
}) {
  const t = useTranslations("Diagnostic.wizard");
  const tRadar = useTranslations("Radar");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const dimensions = extract.dimensions;
  const [idx, setIdx] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(dimensions.map((d) => [d.key, initialDraft(d)])),
  );
  const [verdicts, setVerdicts] = useState<Record<string, DimensionVerdict>>({});
  const [recap, setRecap] = useState(false);

  const result = useMemo<WizardResult>(() => {
    const answers: Record<string, string> = {};
    const confirmed: string[] = [];
    const adjusted: string[] = [];
    const skipped: string[] = [];
    for (const d of dimensions) {
      const verdict = verdicts[d.key];
      if (verdict === "skipped") {
        skipped.push(d.key);
        continue;
      }
      if (!verdict) continue;
      const text = (drafts[d.key] ?? "").trim();
      if (text) answers[d.key] = text;
      (verdict === "adjusted" ? adjusted : confirmed).push(d.key);
    }
    return { answers, confirmed, adjusted, skipped };
  }, [dimensions, drafts, verdicts]);

  function decide(verdict: DimensionVerdict) {
    const current = dimensions[idx];
    setVerdicts((prev) => ({ ...prev, [current.key]: verdict }));
    if (idx + 1 < dimensions.length) setIdx(idx + 1);
    else setRecap(true);
  }

  function goBack() {
    if (recap) {
      setRecap(false);
      return;
    }
    if (idx > 0) setIdx(idx - 1);
  }

  /**
   * Barre de progression CONTINUE — volontairement pas de pastilles numérotées : le porteur
   * ne doit pas "voir" un compteur d'étapes à franchir, juste sentir qu'il avance.
   */
  const progressPct = recap ? 100 : Math.round(((idx + 1) / dimensions.length) * 100);
  const progress = (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progressPct}
    >
      <div
        className="h-full rounded-full bg-coral-strong transition-all duration-300"
        style={{ width: `${progressPct}%` }}
      />
    </div>
  );

  // --- RÉCAP : ce qui a été tranché, avant de lancer l'analyse ---
  if (recap) {
    const decided = result.confirmed.length + result.adjusted.length;
    const skippedLabels = dimensions
      .filter((d) => result.skipped.includes(d.key))
      .map((d) => d.label);

    return (
      <div className="space-y-5">
        {progress}

        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">{t("recapTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("recapSubtitle", { decided, total: dimensions.length })}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <span className="font-medium text-success">
              {t("recapConfirmed", { count: decided })}
            </span>
            {skippedLabels.length > 0 && (
              <span className="font-medium text-warning">
                {t("recapSkipped", { count: skippedLabels.length })}
              </span>
            )}
          </div>
          {skippedLabels.length > 0 && (
            <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
              {t("recapSkippedHint", { labels: skippedLabels.join(", ") })}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={goBack} disabled={submitting}>
            <ArrowLeft className="size-4" />
            {t("back")}
          </Button>
          <Button onClick={() => onComplete(result)} loading={submitting}>
            {submitLabel ?? t("submit")}
          </Button>
        </div>
      </div>
    );
  }

  // --- UNE DIMENSION ---
  const dim = dimensions[idx];
  const draft = drafts[dim.key] ?? "";
  const suggestion = (dim.suggestion || "").trim();
  const untouched = draft.trim() === suggestion && suggestion.length > 0;
  const pillar = PILLAR_BY_KEY[dim.key];
  const pillarLabel = pillar ? tRadar(`pillars.${pillar}.label`) : null;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        {onExit && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onExit}
              className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {t("exit")}
            </button>
          </div>
        )}
        {progress}
      </div>

      <div>
        {pillarLabel && (
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              PILLAR_COLOR[pillar] ?? "text-muted-foreground"
            }`}
          >
            {pillarLabel}
          </span>
        )}
        <h2 className="mt-1 font-display text-xl font-bold tracking-tight">
          {dim.label}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{dim.question}</p>
      </div>

      {dim.evidence?.trim() && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("youSaid")}
          </span>
          <p className="border-l-2 border-coral-strong/55 pl-3.5 text-sm italic text-muted-foreground">
            {dim.evidence}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-coral-strong">
          {t("iDeduced")}
        </span>
        <Textarea
          ref={textareaRef}
          rows={4}
          value={draft}
          placeholder={t("placeholder")}
          onChange={(e) => setDrafts((prev) => ({ ...prev, [dim.key]: e.target.value }))}
        />
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 shrink-0 text-coral-strong" />
          {t("provisionalHint")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Button onClick={() => decide(untouched ? "confirmed" : "adjusted")} disabled={!draft.trim()}>
          <Check className="size-4" />
          {untouched ? t("asIs") : t("validateMine")}
        </Button>
        {untouched && (
          <Button variant="outline" onClick={() => textareaRef.current?.focus()}>
            <Pencil className="size-4" />
            {t("adjust")}
          </Button>
        )}
        <Button variant="ghost" onClick={() => decide("skipped")}>
          <HelpCircle className="size-4" />
          {t("notYet")}
        </Button>
        {idx > 0 && (
          <Button variant="ghost" size="sm" onClick={goBack} className="ml-auto">
            <ArrowLeft className="size-4" />
            {t("back")}
          </Button>
        )}
      </div>
    </div>
  );
}
