"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PencilLine, Plus, X } from "lucide-react";

import { Button, Card, CardContent, Field, Input, Select, SelectItem, Textarea, toast } from "@/shared/ui";
import { RadarScoreForm, type RadarScoreSubmission } from "@/features/scoring";
import type { components } from "@/shared/api/schema";

import { adjustReportScores, editReportContent } from "../actions";
// `../api` est server-only (next/headers) : on prend le type et l'adaptateur pur, pas le module réseau.
import { toRadarScore } from "../lib/radar";

type ReportDetail = components["schemas"]["ReportDetailOut"];

type RiskItem = components["schemas"]["RiskItem"];
type Recommendation = components["schemas"]["Recommendation"];

const VERDICT_STATUSES = ["go", "conditional", "nogo"] as const;

/**
 * Reprise humaine d'un bilan (analyste assigné / admin — garde réelle côté backend).
 *
 * Deux gestes distincts, deux endpoints : corriger les **notes** crée un ScoreRun de
 * source `human` ; corriger le **texte** fusionne les champs fournis. On n'envoie donc
 * jamais que ce qui a été touché — le reste du bilan est laissé intact.
 */
export function BilanEditor({ report }: { report: ReportDetail }) {
  const t = useTranslations("Bilan.edit");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const insights = report.report ?? null;
  const [summary, setSummary] = useState(insights?.summary ?? "");
  const [verdictStatus, setVerdictStatus] = useState(insights?.verdict?.status ?? "");
  const [verdictLabel, setVerdictLabel] = useState(insights?.verdict?.label ?? "");
  const [verdictAnalysis, setVerdictAnalysis] = useState(insights?.verdict?.analysis ?? "");
  const [risks, setRisks] = useState<RiskItem[]>(insights?.risks ?? []);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    insights?.recommendations ?? [],
  );

  function saveScores(submission: RadarScoreSubmission) {
    startTransition(async () => {
      const res = await adjustReportScores(report.id, {
        axes: submission.axes,
        justifications: Object.keys(submission.justifications).length
          ? submission.justifications
          : null,
        grid_version: report.grid_version ?? null,
      });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success(t("scoresSaved"));
      router.refresh();
    });
  }

  function saveContent() {
    startTransition(async () => {
      const res = await editReportContent(report.id, {
        summary,
        verdict: { status: verdictStatus, label: verdictLabel, analysis: verdictAnalysis },
        risks,
        recommendations,
      });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success(t("contentSaved"));
      router.refresh();
    });
  }

  if (!open) {
    return (
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <PencilLine className="size-4" />
          {t("open")}
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">{t("title")}</h2>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            <X className="size-4" />
            {t("close")}
          </Button>
        </div>

        {/* Couche rédigée */}
        <div className="space-y-4">
          <h3 className="font-display text-sm font-bold">{t("contentTitle")}</h3>

          <Field label={t("summary")}>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("verdictStatus")}>
              <Select
                value={verdictStatus}
                onValueChange={setVerdictStatus}
                placeholder={t("verdictPlaceholder")}
              >
                {VERDICT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`verdict.${s}`)}
                  </SelectItem>
                ))}
              </Select>
            </Field>
            <Field label={t("verdictLabel")}>
              <Input value={verdictLabel} onChange={(e) => setVerdictLabel(e.target.value)} />
            </Field>
          </div>

          <Field label={t("verdictAnalysis")}>
            <Textarea
              value={verdictAnalysis}
              onChange={(e) => setVerdictAnalysis(e.target.value)}
            />
          </Field>

          <EditableList
            title={t("risks")}
            addLabel={t("addRisk")}
            items={risks}
            onAdd={() => setRisks((prev) => [...prev, { text: "", probability: "", severity: "" }])}
            onRemove={(i) => setRisks((prev) => prev.filter((_, index) => index !== i))}
            render={(risk, i) => (
              <Input
                value={risk.text ?? ""}
                placeholder={t("riskPlaceholder")}
                onChange={(e) =>
                  setRisks((prev) =>
                    prev.map((r, index) => (index === i ? { ...r, text: e.target.value } : r)),
                  )
                }
              />
            )}
          />

          <EditableList
            title={t("recommendations")}
            addLabel={t("addRecommendation")}
            items={recommendations}
            onAdd={() =>
              setRecommendations((prev) => [
                ...prev,
                { title: "", description: "", priority: prev.length + 1 },
              ])
            }
            onRemove={(i) =>
              setRecommendations((prev) => prev.filter((_, index) => index !== i))
            }
            render={(rec, i) => (
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  value={rec.title ?? ""}
                  placeholder={t("recommendationTitle")}
                  onChange={(e) =>
                    setRecommendations((prev) =>
                      prev.map((r, index) =>
                        index === i ? { ...r, title: e.target.value } : r,
                      ),
                    )
                  }
                />
                <Input
                  value={rec.description ?? ""}
                  placeholder={t("recommendationDescription")}
                  onChange={(e) =>
                    setRecommendations((prev) =>
                      prev.map((r, index) =>
                        index === i ? { ...r, description: e.target.value } : r,
                      ),
                    )
                  }
                />
              </div>
            )}
          />

          <Button loading={pending} onClick={saveContent}>
            {t("saveContent")}
          </Button>
        </div>

        {/* Notes */}
        <div className="space-y-3 border-t border-border pt-6">
          <div>
            <h3 className="font-display text-sm font-bold">{t("scoresTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("scoresSubtitle")}</p>
          </div>
          <RadarScoreForm
            initial={report.radar_score ? toRadarScore(report.radar_score) : null}
            pending={pending}
            onSubmit={saveScores}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/** Liste éditable minimale : ajouter / retirer une ligne, le rendu de la ligne est délégué. */
function EditableList<T>({
  title,
  addLabel,
  items,
  onAdd,
  onRemove,
  render,
}: {
  title: string;
  addLabel: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  render: (item: T, index: number) => React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="min-w-0 flex-1">{render(item, i)}</div>
          <Button variant="ghost" size="icon" onClick={() => onRemove(i)} aria-label={`${title} — ${i + 1}`}>
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={onAdd}>
        <Plus className="size-4" />
        {addLabel}
      </Button>
    </div>
  );
}
