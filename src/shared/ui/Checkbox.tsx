"use client";

import { useId } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/shared/lib/utils";

/**
 * Checkbox — case à cocher accessible (Radix), avec libellé optionnel.
 * Cible tactile ≥ 44px (zone de clic du label).
 */
export function Checkbox({
  className,
  label,
  id,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & { label?: string }) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  const box = (
    <CheckboxPrimitive.Root
      id={checkboxId}
      className={cn(
        "peer flex size-5 shrink-0 items-center justify-center rounded-[6px] border border-input bg-card transition-colors",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
        "data-[state=checked]:border-coral-strong data-[state=checked]:bg-coral-strong data-[state=checked]:text-white",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label) return box;

  return (
    <label
      htmlFor={checkboxId}
      className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-foreground"
    >
      {box}
      {label}
    </label>
  );
}
