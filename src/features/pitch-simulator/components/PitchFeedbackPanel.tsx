import { ThumbsUp, Wrench } from "lucide-react";

import {
  AXES,
  RadarChart,
  reading,
  type RadarScore,
} from "@/features/scoring";

/**
 * Feedback structuré de fin de session, scoré sur les 6 axes du Radar
 * (réutilise @/features/scoring — la boussole). Points forts / à travailler.
 */
export function PitchFeedbackPanel({ score }: { score: RadarScore }) {
  const ranked = [...AXES].sort(
    (a, b) => (score.axes[b.key] ?? 0) - (score.axes[a.key] ?? 0),
  );
  const strengths = ranked.slice(0, 2);
  const toWork = ranked.slice(-2).reverse();

  return (
    <div className="grid items-center gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr]">
      <div className="mx-auto">
        <RadarChart score={score} size={240} />
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <ThumbsUp className="size-4 text-success" />
            Points forts
          </h3>
          <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
            {strengths.map((a) => (
              <li key={a.key}>
                {a.label} — {reading(score.axes[a.key] ?? 0).label.toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <Wrench className="size-4 text-coral-strong" />
            À travailler
          </h3>
          <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
            {toWork.map((a) => (
              <li key={a.key}>{a.label}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
