import { Check } from "lucide-react";

import { cn } from "@/shared/lib/utils";

/**
 * Stepper — progression d'un parcours (onboarding, diagnostic guidé).
 * Mobile-first : compact, labels masqués sur très petit écran.
 */
export interface StepperProps {
  steps: string[];
  /** Index de l'étape courante (0-based). */
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol
      className={cn("flex items-center gap-2", className)}
      aria-label="Progression"
    >
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={label}
            className="flex flex-1 items-center gap-2"
            aria-current={active ? "step" : undefined}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-display font-bold transition-colors",
                done && "border-coral-strong bg-coral-strong text-white",
                active && "border-coral-strong text-coral-strong",
                !done && !active && "border-border text-muted-foreground",
              )}
            >
              {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden truncate text-sm sm:block",
                active ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "h-px flex-1 transition-colors",
                  done ? "bg-coral-strong" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
