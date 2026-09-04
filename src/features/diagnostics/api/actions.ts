"use server";

import { ApiError, apiErrorMessage, apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

import type { SectorKey } from "../data/sectors";

/**
 * Lancement du diagnostic guidé (Sprint INT). `POST /diagnostics` crée projet + bilan `pending`
 * et enqueue l'analyse (worker LLM) → réponse 202 avec le `report_id` à suivre (poll du bilan).
 */
type DiagnosticCreatedOut = components["schemas"]["DiagnosticCreatedOut"];

export type StartDiagnosticResult =
  | { ok: true; reportId: string }
  | { ok: false; message: string; unauthorized?: boolean };

export interface ManualDiagnosticPayload {
  projectName: string;
  /** Clé du vocabulaire fermé (`data/sectors.ts`) — confirmée par le porteur. */
  sector: SectorKey;
  description: string;
  fundingNeed?: number;
  consent: boolean;
  answers: Record<string, string>;
}

export async function startManualDiagnostic(
  input: ManualDiagnosticPayload,
): Promise<StartDiagnosticResult> {
  try {
    const created = await apiFetch<DiagnosticCreatedOut>("/api/v1/diagnostics", {
      method: "POST",
      json: {
        projectName: input.projectName,
        sector: input.sector,
        description: input.description,
        consent: input.consent,
        fundingNeed: input.fundingNeed,
        answers: input.answers,
      },
    });
    return { ok: true, reportId: created.report_id };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) return { ok: false, message: "Connecte-toi pour lancer ton diagnostic.", unauthorized: true };
      if (error.status === 422) return { ok: false, message: "Vérifie les champs : il manque une information." };
    }
    return {
      ok: false,
      message: apiErrorMessage(error, "Analyse impossible pour l'instant. Réessaie dans un instant."),
    };
  }
}


// --- « Raconte, on structure » : extraction du récit libre → 12 dimensions ---

export interface ExtractedDimension {
  key: string;
  label: string;
  captured: boolean;
  evidence: string;
  question: string;
  /** Brouillon proposé (trou) : « bonne hallucination » extrapolée du récit, à confirmer/ajuster. */
  suggestion: string;
}

/**
 * Classement sectoriel déduit du récit — une PROPOSITION, jamais une décision.
 * Le porteur tranche (`SectorConfirm`) : le secteur est un fait sur le projet, pas un
 * jugement de sa valeur, il peut donc le corriger sans cesser d'être la source.
 * Type pris sur le contrat backend, jamais recopié.
 */
export type SectorProposal = components["schemas"]["SectorProposal"];

export interface IdeaExtract {
  project_name: string | null;
  sector_proposal?: SectorProposal | null;
  captured_count: number;
  total: number;
  dimensions: ExtractedDimension[];
  gaps: ExtractedDimension[];
}

export type ExtractResult =
  | { ok: true; data: IdeaExtract }
  | { ok: false; message: string };

/** Récit libre → dimensions captées/manquantes (endpoint public + rate-limité). */
export async function extractIdea(
  idea: string,
  projectName?: string,
  lang: string = "fr",
  currency: string = "XOF",
): Promise<ExtractResult> {
  try {
    const data = await apiFetch<IdeaExtract>("/api/v1/diagnostics/extract", {
      method: "POST",
      json: { idea, projectName, consent: true, lang, currency },
    });
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return { ok: false, message: "Trop de demandes — réessaie dans une minute." };
    }
    return { ok: false, message: "Analyse impossible pour l'instant. Réessaie." };
  }
}

export type ExtractFileResult =
  | { ok: true; data: IdeaExtract; description: string }
  | { ok: false; message: string };

/**
 * Upload PDF/DOCX → extraction de texte côté backend → même pipeline 'Raconte'.
 * Le `description` retourné est le texte brut extrait (utilisé dans le payload de scoring).
 */
export async function extractFileIdea(formData: FormData): Promise<ExtractFileResult> {
  try {
    const raw = await apiFetch<IdeaExtract & { source_text?: string }>(
      "/api/v1/diagnostics/extract-file",
      { method: "POST", formData },
    );
    return { ok: true, data: raw, description: raw.source_text ?? "" };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 413) return { ok: false, message: "Fichier trop grand (max 20 Mo)." };
      if (error.status === 415) return { ok: false, message: "Format non supporté (PDF ou DOCX uniquement)." };
      if (error.status === 422) return { ok: false, message: "Le document semble vide ou illisible. Essaie le flow 'Raconte'." };
      if (error.status === 429) return { ok: false, message: "Trop de demandes — réessaie dans une minute." };
    }
    return {
      ok: false,
      message: apiErrorMessage(error, "Lecture du document impossible pour l'instant. Réessaie."),
    };
  }
}

/**
 * Brouillon de diagnostic — la saisie en cours, côté SERVEUR.
 *
 * Le `localStorage` reste la persistance du parcours ANONYME : c'est le comportement
 * conforme, la donnée reste sur l'appareil du visiteur tant qu'il n'a pas de compte. Une
 * fois connecté, le serveur devient la source de vérité — ce qui permet de reprendre sur
 * un autre appareil, de survivre à un nettoyage de cache, et surtout de MESURER où les
 * porteurs décrochent, ce qu'aucune autre donnée ne dit.
 */
type DiagnosticDraftOut = components["schemas"]["DiagnosticDraftOut"];

export interface DraftPayload {
  answers: Record<string, string>;
  /** Métadonnées du récit (title, sector, extract…), rejouées à la reprise. */
  payload: Record<string, unknown>;
  /** Dernière dimension ouverte — le champ qui situe le décrochage. */
  lastDimension?: string | null;
}

/**
 * Enregistre l'état COMPLET du brouillon (pas un delta). Idempotent : appelé à chaque
 * changement de dimension.
 *
 * Ne lève JAMAIS. Une sauvegarde en échec ne doit pas interrompre la saisie : en zone à
 * connectivité faible, un wizard qui bloque sur une requête est inutilisable. On rend
 * `false`, l'appelant continue, et la dimension suivante retentera.
 */
export async function saveDiagnosticDraft(input: DraftPayload): Promise<boolean> {
  try {
    await apiFetch<DiagnosticDraftOut>("/api/v1/diagnostics/draft", {
      method: "PUT",
      json: {
        answers: input.answers,
        payload: input.payload,
        lastDimension: input.lastDimension ?? null,
      },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Brouillon vivant du porteur, ou `null`.
 *
 * `null` couvre le cas normal (404 : rien à reprendre) ET les pannes. Ce choix est
 * délibéré : l'écran de relecture doit s'ouvrir même si le brouillon est inaccessible, et
 * le repli — `localStorage`, sinon écran vide — reste utilisable. Perdre la reprise est
 * gênant ; bloquer le porteur devant une erreur le serait davantage.
 */
export async function loadDiagnosticDraft(): Promise<DiagnosticDraftOut | null> {
  try {
    return await apiFetch<DiagnosticDraftOut>("/api/v1/diagnostics/draft");
  } catch {
    return null;
  }
}

// Pas d'action de SUPPRESSION ici : `DELETE /diagnostics/draft` existe côté backend (et y
// est testé), mais aucune surface ne l'appelle. « Recommencer » écrase les réponses plutôt
// que de supprimer le brouillon, sinon le récit serait perdu. Le jour où un vrai abandon
// de projet aura une UI, l'action tiendra en quatre lignes.
