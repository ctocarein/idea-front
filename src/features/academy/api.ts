import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

/**
 * Données réelles Academy (Sprint INT). Progression = `learning_progress` côté backend ;
 * leçons = référentiel `lessons`.
 */
export type AcademyProgressData = components["schemas"]["AcademyProgressOut"];
export type LessonSummary = components["schemas"]["LessonOut"];
export type LessonDetail = components["schemas"]["LessonDetailOut"];

/** Progression du porteur connecté (leçons complétées / total). */
export async function getAcademyProgress(): Promise<AcademyProgressData> {
  return apiFetch<AcademyProgressData>("/api/v1/academy/progress");
}

/** Référentiel des leçons (triées par position côté backend). */
export async function getLessons(): Promise<LessonSummary[]> {
  return apiFetch<LessonSummary[]>("/api/v1/academy/lessons");
}

/** Détail d'une leçon (corps complet). */
export async function getLessonDetail(slug: string): Promise<LessonDetail> {
  return apiFetch<LessonDetail>(`/api/v1/academy/lessons/${slug}`);
}
