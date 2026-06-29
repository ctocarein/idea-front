"use server";

import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

type DocumentOut = components["schemas"]["DocumentOut"];
type UploadUrlOut = components["schemas"]["UploadUrlOut"];

export type UploadUrlResult = { ok: true; data: UploadUrlOut } | { ok: false; message: string };
export type DocumentResult = { ok: true; doc: DocumentOut } | { ok: false; message: string };
export type DeleteResult = { ok: true } | { ok: false; message: string };

/** Demande une URL PUT signée (5 min) pour uploader directement sur MinIO. */
export async function requestUploadUrl(
  filename: string,
  contentType: string,
  size: number,
): Promise<UploadUrlResult> {
  try {
    const data = await apiFetch<UploadUrlOut>("/api/v1/documents/upload-url", {
      method: "POST",
      json: { filename, content_type: contentType, size },
    });
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Impossible d'initialiser l'upload. Réessaie." };
  }
}

/** Confirme l'upload après que le client a PUT le fichier sur MinIO. */
export async function confirmUpload(documentId: string): Promise<DocumentResult> {
  try {
    const doc = await apiFetch<DocumentOut>("/api/v1/documents/confirm", {
      method: "POST",
      json: { document_id: documentId },
    });
    return { ok: true, doc };
  } catch {
    return { ok: false, message: "Confirmation échouée — le fichier n'a peut-être pas été reçu." };
  }
}

/** Supprime un document (métadonnées + objet MinIO). */
export async function deleteDocument(documentId: string): Promise<DeleteResult> {
  try {
    await apiFetch(`/api/v1/documents/${documentId}`, { method: "DELETE" });
    return { ok: true };
  } catch {
    return { ok: false, message: "Suppression impossible pour l'instant. Réessaie." };
  }
}
