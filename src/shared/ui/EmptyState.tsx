import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

/**
 * EmptyState — écran vide (CHARTE_FRONTEND.md §1.6 : « une invitation à agir,
 * pas une humeur »). Reçoit une icône, un titre, une aide et une action.
 */
export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Bouton/CTA d'action (ex. « Lancer mon diagnostic »). */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Icon className="size-6" />
        </span>
      ) : null}
      <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
