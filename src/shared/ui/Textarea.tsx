"use client";

import { cn } from "@/shared/lib/utils";
import { describedBy, useFieldContext } from "./field-context";

/** Textarea — saisie multi-lignes (diagnostic, feedback). */
export function Textarea({
  className,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const field = useFieldContext();

  return (
    <textarea
      id={id ?? field.id}
      aria-invalid={ariaInvalid ?? field.invalid}
      aria-describedby={ariaDescribedBy ?? describedBy(field)}
      className={cn(
        "min-h-24 w-full rounded-md border border-input bg-card px-3.5 py-3 text-[15px] text-foreground",
        "placeholder:text-muted-foreground/70",
        "transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}
