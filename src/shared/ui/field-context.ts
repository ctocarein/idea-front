"use client";

import { createContext, useContext } from "react";

/** Contexte interne du Field : relie label / aide / erreur au contrôle (aria). */
export interface FieldContextValue {
  id?: string;
  descriptionId?: string;
  errorId?: string;
  invalid?: boolean;
}

export const FieldContext = createContext<FieldContextValue>({});

export function useFieldContext() {
  return useContext(FieldContext);
}

/** Construit la valeur d'`aria-describedby` à partir des ids présents. */
export function describedBy(ctx: FieldContextValue) {
  return (
    [ctx.invalid ? ctx.errorId : null, ctx.descriptionId]
      .filter(Boolean)
      .join(" ") || undefined
  );
}
