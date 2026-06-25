import { TrendingUp } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { pitchHistory } from "../data/mock";

/**
 * Progression des scores de pitch dans le temps (la transformation visible).
 * Barres simples ; au Sprint INT, données issues de `practice_sessions`.
 */
export function PitchProgress({ className }: { className?: string }) {
  const max = 100;
  const first = pitchHistory[0]?.score ?? 0;
  const last = pitchHistory[pitchHistory.length - 1]?.score ?? 0;
  const delta = last - first;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold">Ma progression</h3>
        {delta > 0 ? (
          <span className="flex items-center gap-1 text-sm font-medium text-success">
            <TrendingUp className="size-4" />+{delta}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-end gap-3">
        {pitchHistory.map((p) => (
          <div key={p.session} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="tabular text-xs text-muted-foreground">
              {p.score}
            </span>
            <div className="flex h-28 w-full items-end">
              <div
                className="w-full rounded-t-md bg-coral-strong/80"
                style={{ height: `${(p.score / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">#{p.session}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
