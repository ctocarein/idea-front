import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

export type DocumentOut = components["schemas"]["DocumentOut"];
export type UploadUrlOut = components["schemas"]["UploadUrlOut"];

/** Liste des documents du porteur connecté. */
export async function getDocuments(): Promise<DocumentOut[]> {
  return apiFetch<DocumentOut[]>("/api/v1/documents");
}
