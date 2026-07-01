"use server";

import { apiFetch } from "@/shared/api/client";

export interface PitchSection {
  key: string;
  title: string;
  content: string;
  hint: string;
}

export interface PitchData {
  id: string;
  title: string;
  sections: PitchSection[];
  updated_at: string;
}

export type PitchResult = { ok: true; pitch: PitchData } | { ok: false; message: string };

/** Récupère (ou crée) le pitch du porteur connecté. */
export async function getPitch(): Promise<PitchData> {
  return apiFetch<PitchData>("/api/v1/pitch");
}

/** Enregistre le contenu d'une section. */
export async function updateSection(
  pitchId: string,
  key: string,
  content: string,
): Promise<PitchResult> {
  try {
    const pitch = await apiFetch<PitchData>(
      `/api/v1/pitch/${pitchId}/sections/${key}`,
      { method: "PATCH", json: { content } },
    );
    return { ok: true, pitch };
  } catch {
    return { ok: false, message: "Impossible d'enregistrer. Réessaie." };
  }
}

/** Demande à l'IA de rédiger/améliorer une section (nourrie par le Workshop). */
export async function generateSection(
  pitchId: string,
  key: string,
): Promise<{ ok: true; content: string } | { ok: false; message: string }> {
  try {
    const res = await apiFetch<{ key: string; content: string }>(
      `/api/v1/pitch/${pitchId}/sections/${key}/generate`,
      { method: "POST" },
    );
    return { ok: true, content: res.content };
  } catch {
    return { ok: false, message: "L'IA n'a pas pu rédiger cette section. Réessaie." };
  }
}
