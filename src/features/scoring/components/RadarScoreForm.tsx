"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button, Card, CardContent, Textarea } from "@/shared/ui";

import { AXES, PILLARS, SCALE_MAX, type AxisKey, type RadarScore } from "../types/scoring.types";

export interface RadarScoreSubmission {
  axes: Record<string, number>;
  justifications: Record<string, string>;
}

/**
 * Saisie des 12 dimensions (ARCHITECTURE_FRONTEND.md §10bis.1) — vue EXPERT.
 *
 * Réservée à l'analyste/mentor lors d'une reprise humaine : le porteur, lui, ne voit
 * jamais douze notes, il voit le tableau de compréhension. Chaque note peut être
 * justifiée : un score corrigé sans motif n'apprend rien à personne.
 */
export function RadarScoreForm({
  initial,
  pending = false,
  onSubmit,
}: {
  initial: RadarScore | null;
  pending?: boolean;
  onSubmit: (submission: RadarScoreSubmission) => void;
}) {
  const t = useTranslations("Bilan.edit");
  const tRadar = useTranslations("Radar");

  const [axes, setAxes] = useState<Record<string, number>>(() =>
    Object.fromEntries(AXES.map((a) => [a.key, initial?.axes[a.key as AxisKey] ?? 0])),
  );
  const [justifications, setJustifications] = useState<Record<string, string>>({});

  function setAxis(key: string, raw: string) {
    const value = Number(raw);
    if (Number.isNaN(value)) return;
    setAxes((prev) => ({ ...prev, [key]: Math.min(SCALE_MAX, Math.max(0, Math.round(value))) }));
  }

  return (
    <div className="space-y-4">
      {PILLARS.map((pillar) => (
        <Card key={pillar.key}>
          <CardContent className="space-y-4 pt-6">
            <h3 className="font-display text-sm font-bold">
              {tRadar.has(`pillars.${pillar.key}.label`)
                ? tRadar(`pillars.${pillar.key}.label`)
                : pillar.label}
            </h3>
            {AXES.filter((a) => a.pillar === pillar.key).map((axis) => (
              <div key={axis.key} className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="tabular w-10 shrink-0 text-xs font-semibold text-muted-foreground">
                    {axis.code}
                  </span>
                  <label htmlFor={`axis-${axis.key}`} className="min-w-0 flex-1 text-sm">
                    {tRadar.has(`${axis.key}.label`) ? tRadar(`${axis.key}.label`) : axis.label}
                  </label>
                  <input
                    id={`axis-${axis.key}`}
                    type="range"
                    min={0}
                    max={SCALE_MAX}
                    step={1}
                    value={axes[axis.key]}
                    onChange={(e) => setAxis(axis.key, e.target.value)}
                    className="w-32 accent-[var(--coral-strong)]"
                  />
                  <span className="tabular w-12 shrink-0 text-right text-sm font-semibold">
                    {axes[axis.key]}/{SCALE_MAX}
                  </span>
                </div>
                <Textarea
                  rows={1}
                  className="min-h-11 py-2 text-sm"
                  placeholder={t("justificationPlaceholder")}
                  value={justifications[axis.key] ?? ""}
                  onChange={(e) =>
                    setJustifications((prev) => ({ ...prev, [axis.key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button
        loading={pending}
        onClick={() =>
          onSubmit({
            axes,
            // On n'envoie que les motifs réellement écrits.
            justifications: Object.fromEntries(
              Object.entries(justifications).filter(([, v]) => v.trim().length > 0),
            ),
          })
        }
      >
        {t("saveScores")}
      </Button>
    </div>
  );
}
