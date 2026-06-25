"use client";

import { useId } from "react";
import * as Label from "@radix-ui/react-label";

import { cn } from "@/shared/lib/utils";
import { FieldContext } from "./field-context";

export interface FieldProps {
  label?: string;
  /** Texte d'aide sous le contrôle. */
  description?: string;
  /** Message d'erreur ; rend le champ invalide (aria-invalid) quand présent. */
  error?: string;
  /** Marque le champ requis (astérisque visuel). */
  required?: boolean;
  className?: string;
  /** Le contrôle (Input, Textarea, Select…). */
  children: React.ReactNode;
}

/**
 * Field — label + aide + erreur (CHARTE_FRONTEND.md §2.2).
 * Câble automatiquement les ids et l'aria du contrôle enfant via contexte.
 */
export function Field({
  label,
  description,
  error,
  required,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const invalid = Boolean(error);

  return (
    <FieldContext.Provider value={{ id, descriptionId, errorId, invalid }}>
      <div className={cn("space-y-1.5", className)}>
        {label ? (
          <Label.Root
            htmlFor={id}
            className="text-sm font-medium text-foreground"
          >
            {label}
            {required ? (
              <span className="ml-0.5 text-destructive" aria-hidden>
                *
              </span>
            ) : null}
          </Label.Root>
        ) : null}

        {children}

        {description && !error ? (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}

        {error ? (
          <p id={errorId} className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}
