import { Loader2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";

/** Indicateur de chargement (états loading des boutons, zones async). */
export function Spinner({
  className,
  ...props
}: React.ComponentProps<typeof Loader2>) {
  return (
    <Loader2
      role="status"
      aria-label="Chargement"
      className={cn("animate-spin", className)}
      {...props}
    />
  );
}
