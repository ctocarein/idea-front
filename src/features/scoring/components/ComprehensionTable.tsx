import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui";
import {
  AXES,
  PILLARS,
  SCALE_MAX,
  pillarScore,
  reading,
  type RadarScore,
  type ReadingTone,
} from "../types/scoring.types";

/**
 * ComprehensionTable — la vue porteur (CHARTE §10bis.1) : les 4 piliers
 * sens / viabilité / scalabilité / exécution qui agrègent les 12 dimensions.
 * Pédagogique et non culpabilisante — « on part d'où tu es ».
 */
const TONE_BADGE: Record<ReadingTone, "success" | "primary" | "warning" | "neutral"> = {
  strong: "success",
  good: "primary",
  watch: "warning",
  fragile: "neutral",
};

const TONE_BAR: Record<ReadingTone, string> = {
  strong: "bg-success",
  good: "bg-coral-strong",
  watch: "bg-warning",
  fragile: "bg-muted-foreground",
};

function Bar({ ratio, tone }: { ratio: number; tone: ReadingTone }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-secondary">
      <div
        className={cn("h-full rounded-full", TONE_BAR[tone])}
        style={{ width: `${Math.round(ratio * 100)}%` }}
      />
    </div>
  );
}

export function ComprehensionTable({
  score,
  className,
}: {
  score: RadarScore;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {PILLARS.map((pillar) => {
        const value = pillarScore(score, pillar.key); // 0..SCALE_MAX
        const r = reading((value / SCALE_MAX) * 100); // lecture qualitative sur 100
        const axes = AXES.filter((a) => a.pillar === pillar.key);
        return (
          <div
            key={pillar.key}
            className="space-y-3 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold">{pillar.label}</h3>
                <p className="text-xs text-muted-foreground">{pillar.question}</p>
              </div>
              <Badge variant={TONE_BADGE[r.tone]}>{r.label}</Badge>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="tabular font-display text-2xl font-extrabold">{value}</span>
              <span className="text-sm text-muted-foreground">/{SCALE_MAX}</span>
            </div>
            <Bar ratio={value / SCALE_MAX} tone={r.tone} />

            <ul className="space-y-1.5 pt-1">
              {axes.map((axis) => (
                <li
                  key={axis.key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate text-muted-foreground">{axis.label}</span>
                  <span className="tabular shrink-0 font-medium">
                    {score.axes[axis.key] ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
