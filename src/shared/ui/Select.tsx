"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { describedBy, useFieldContext } from "./field-context";

/**
 * Select — liste déroulante accessible (Radix). Stylé aux tokens « Aube ».
 * Usage : <Select value onValueChange><SelectItem .../></Select>
 */
export function Select({
  placeholder,
  className,
  children,
  id,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root> & {
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  const field = useFieldContext();

  return (
    <SelectPrimitive.Root {...props}>
      <SelectPrimitive.Trigger
        id={id ?? field.id}
        aria-invalid={field.invalid}
        aria-describedby={describedBy(field)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3.5 text-[15px] text-foreground",
          "transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[placeholder]:text-muted-foreground/70",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 text-muted-foreground" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-50 max-h-72 min-w-(--radix-select-trigger-width) overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-[var(--shadow-card)]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        >
          <SelectPrimitive.Viewport className="p-1">
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-2.5 pl-3 pr-8 text-[15px] outline-none",
        "focus:bg-secondary data-[state=checked]:font-medium data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2.5">
        <Check className="size-4 text-coral" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
