import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

/**
 * Badge — état/étiquette sans métier (CHARTE_FRONTEND.md §10 archi).
 * Il reçoit une intention en prop ; il ignore ce qu'est un projet.
 * Le mapping statut → variante vit dans le feature (ex. ProjectStatusBadge).
 */
export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        neutral: "bg-secondary text-secondary-foreground",
        primary: "bg-coral/15 text-coral-strong",
        success: "bg-success/15 text-success",
        warning: "bg-warning/20 text-[color:color-mix(in_oklab,var(--warning),black_25%)]",
        danger: "bg-destructive/12 text-destructive",
        outline: "border border-border text-muted-foreground",
        verified: "bg-dawn text-ink", // sceau « vérifié » — signature
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
