import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";
import { Spinner } from "./Spinner";

/**
 * Button — primitif d'action (CHARTE_FRONTEND.md §2.2).
 * Aplats uniquement (jamais le dégradé d'aube). Un seul accent d'action par écran.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-display font-bold " +
    "transition-transform duration-150 active:translate-y-0 " +
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 " +
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-coral-strong text-white shadow-[var(--shadow-cta)] hover:-translate-y-0.5",
        dark: "bg-ink text-white hover:-translate-y-0.5",
        ghost: "bg-transparent text-foreground hover:bg-border/50",
        danger: "bg-destructive text-destructive-foreground hover:-translate-y-0.5",
        outline:
          "border border-border bg-card text-foreground hover:bg-secondary",
      },
      size: {
        sm: "h-10 px-4 text-sm [&_svg]:size-4",
        md: "h-13 px-5 text-base [&_svg]:size-5",
        icon: "size-11 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  // asChild délègue le rendu (ex. <Link>) — pas d'injection de spinner alors.
  if (asChild) {
    return (
      <Slot className={cn(buttonVariants({ variant, size }), className)}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : null}
      {children}
    </button>
  );
}
