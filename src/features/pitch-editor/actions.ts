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
  template_id: string;
  slides: Record<string, unknown>[];
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

/** Génère le deck visuel (slides structurées) depuis les sections ou un texte fourni. */
export async function generateDeck(
  pitchId: string,
  source?: string,
): Promise<PitchResult> {
  try {
    const pitch = await apiFetch<PitchData>(`/api/v1/pitch/${pitchId}/deck/generate`, {
      method: "POST",
      json: { source: source ?? null },
    });
    return { ok: true, pitch };
  } catch {
    return { ok: false, message: "La génération du deck a échoué. Réessaie." };
  }
}

/** Met à jour les champs d'une slide (édition structurée). */
export async function updateSlide(
  pitchId: string,
  index: number,
  fields: Record<string, unknown>,
): Promise<PitchResult> {
  try {
    const pitch = await apiFetch<PitchData>(`/api/v1/pitch/${pitchId}/slides/${index}`, {
      method: "PATCH",
      json: fields,
    });
    return { ok: true, pitch };
  } catch {
    return { ok: false, message: "Impossible d'enregistrer la slide. Réessaie." };
  }
}

/** Supprime une slide. */
export async function deleteSlide(pitchId: string, index: number): Promise<PitchResult> {
  try {
    const pitch = await apiFetch<PitchData>(`/api/v1/pitch/${pitchId}/slides/${index}`, {
      method: "DELETE",
    });
    return { ok: true, pitch };
  } catch {
    return { ok: false, message: "Suppression impossible. Réessaie." };
  }
}

/** Réordonne les slides (nouvel ordre = permutation des indices). */
export async function reorderSlides(pitchId: string, order: number[]): Promise<PitchResult> {
  try {
    const pitch = await apiFetch<PitchData>(`/api/v1/pitch/${pitchId}/slides/reorder`, {
      method: "POST",
      json: { order },
    });
    return { ok: true, pitch };
  } catch {
    return { ok: false, message: "Réorganisation impossible. Réessaie." };
  }
}

/** Change le template (thème) du deck. */
export async function setTemplate(pitchId: string, templateId: string): Promise<PitchResult> {
  try {
    const pitch = await apiFetch<PitchData>(`/api/v1/pitch/${pitchId}/template`, {
      method: "PATCH",
      json: { template_id: templateId },
    });
    return { ok: true, pitch };
  } catch {
    return { ok: false, message: "Impossible de changer le thème. Réessaie." };
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
