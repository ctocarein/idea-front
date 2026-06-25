"use client";

import { useId } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@/shared/lib/utils";

/** RadioGroup — groupe de choix exclusif (Radix). */
export function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2.5", className)}
      {...props}
    />
  );
}

/** RadioItem — une option, avec libellé. Cible tactile ≥ 44px. */
export function RadioItem({
  className,
  label,
  id,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & { label?: string }) {
  const generatedId = useId();
  const radioId = id ?? generatedId;

  const dot = (
    <RadioGroupPrimitive.Item
      id={radioId}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-card transition-colors",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
        "data-[state=checked]:border-coral-strong",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-coral-strong" />
    </RadioGroupPrimitive.Item>
  );

  if (!label) return dot;

  return (
    <label
      htmlFor={radioId}
      className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-foreground"
    >
      {dot}
      {label}
    </label>
  );
}
