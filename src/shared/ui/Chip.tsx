"use client";

import { X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

/**
 * Chip — étiquette interactive (filtre, secteur, tag).
 * `selected` pour un filtre actif ; `onRemove` pour une étiquette supprimable.
 */
export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  onRemove?: () => void;
}

export function Chip({
  className,
  selected = false,
  onRemove,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
        selected
          ? "border-coral-strong bg-coral/15 text-coral-strong"
          : "border-border bg-card text-foreground hover:bg-secondary",
        className,
      )}
      {...props}
    >
      {children}
      {onRemove ? (
        <span
          role="button"
          tabIndex={-1}
          aria-label="Retirer"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-1 inline-flex size-4 items-center justify-center rounded-full hover:bg-foreground/10"
        >
          <X className="size-3" />
        </span>
      ) : null}
    </button>
  );
}
