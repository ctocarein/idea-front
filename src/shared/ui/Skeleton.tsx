import { cn } from "@/shared/lib/utils";

/**
 * Skeleton — placeholder de chargement (CHARTE_FRONTEND.md §4 : jamais d'écran
 * blanc). À utiliser dans les `loading.tsx` / Suspense des features.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-secondary", className)}
      {...props}
    />
  );
}
