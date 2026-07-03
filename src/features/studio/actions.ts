"use server";

import { apiFetch } from "@/shared/api/client";

export interface LogoPalette {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
}

export interface LogoNamePart {
  text: string;
  color: string;
}

export interface LogoSpec {
  name: string;
  tagline?: string;
  mark_type: "icon" | "monogram" | "geometric";
  icon?: string;
  geometric?: string;
  monogram?: string | null;
  layout: string;
  container: string;
  font: string;
  palette: LogoPalette;
  // Peaufinage : wordmark multicolore + réglages du slogan.
  name_color?: string | null;
  name_parts?: LogoNamePart[] | null;
  tagline_font?: string | null;
  tagline_size?: "s" | "m" | "l";
  tagline_color?: string | null;
}

export interface LogoVariation {
  spec: LogoSpec;
  svg: string;
}

export interface LogoData {
  id: string;
  spec: LogoSpec | null;
  svg: string | null;
  variations: LogoVariation[];
  updated_at: string;
}

export type LogoResult = { ok: true; logo: LogoData } | { ok: false; message: string };

/** Récupère (ou crée) le logo du porteur connecté. */
export async function getLogo(): Promise<LogoData> {
  return apiFetch<LogoData>("/api/v1/studio/logo");
}

export interface KitData {
  has_logo: boolean;
  palette?: { primary: string; secondary: string; accent: string; bg: string };
  display_font?: string;
  body_font?: string;
  font_import?: string;
  logo_svg?: string;
}

/** Récupère le kit de marque dérivé du logo. */
export async function getKit(): Promise<KitData> {
  return apiFetch<KitData>("/api/v1/studio/kit");
}

/** Génère 4 concepts de logo (IA + fallback déterministe). */
export async function generateLogo(logoId: string): Promise<LogoResult> {
  try {
    const logo = await apiFetch<LogoData>(`/api/v1/studio/logo/${logoId}/generate`, {
      method: "POST",
    });
    return { ok: true, logo };
  } catch {
    return { ok: false, message: "La génération a échoué. Réessaie." };
  }
}

/** Choisit une des variations proposées comme logo courant. */
export async function selectVariation(logoId: string, index: number): Promise<LogoResult> {
  try {
    const logo = await apiFetch<LogoData>(`/api/v1/studio/logo/${logoId}/select`, {
      method: "POST",
      json: { index },
    });
    return { ok: true, logo };
  } catch {
    return { ok: false, message: "Sélection impossible. Réessaie." };
  }
}

/** Édite le logo courant (couleurs, typo, layout, marque…). */
export async function updateLogo(
  logoId: string,
  patch: Partial<LogoSpec>,
): Promise<LogoResult> {
  try {
    const logo = await apiFetch<LogoData>(`/api/v1/studio/logo/${logoId}`, {
      method: "PATCH",
      json: patch,
    });
    return { ok: true, logo };
  } catch {
    return { ok: false, message: "Impossible d'enregistrer. Réessaie." };
  }
}
