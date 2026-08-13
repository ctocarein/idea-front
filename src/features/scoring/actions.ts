"use server";

import { apiErrorMessage, apiFetch } from "@/shared/api/client";
import type { GridSummary } from "./api";

export type ActivateGridResult = { ok: true; grid: GridSummary } | { ok: false; message: string };

/**
 * Active une version de grille — `POST /admin/scoring/grids/{version}/activate`.
 * Le backend est juge (permission `USER_MANAGE`) et audite l'opération ;
 * une version inconnue répond 404 avec son propre message.
 */
export async function activateGrid(version: string): Promise<ActivateGridResult> {
  try {
    const grid = await apiFetch<GridSummary>(
      `/api/v1/admin/scoring/grids/${encodeURIComponent(version)}/activate`,
      { method: "POST" },
    );
    return { ok: true, grid };
  } catch (error) {
    return { ok: false, message: apiErrorMessage(error, "Activation impossible pour l'instant.") };
  }
}
