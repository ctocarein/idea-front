import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

/**
 * Mentors (Sprint INT). Deux niveaux : marketplace public (porteur), curation (admin),
 * profil & demandes (mentor).
 */
export type MentorApplication = components["schemas"]["MentorApplicationOut"];
export type MentorPublic = components["schemas"]["MentorPublicOut"];
export type MentorProfileMe = components["schemas"]["MentorProfileMeOut"];
export type MentorRequest = components["schemas"]["MentorRequestOut"];

/** Marketplace : mentors actifs (vue porteur). */
export async function getMentors(): Promise<MentorPublic[]> {
  return apiFetch<MentorPublic[]>("/api/v1/mentors");
}

/** Candidatures mentor en attente (admin). */
export async function getMentorApplications(): Promise<MentorApplication[]> {
  return apiFetch<MentorApplication[]>("/api/v1/admin/mentor-applications");
}

/** Profil du mentor connecté (404 si pas encore créé). */
export async function getMyMentorProfile(): Promise<MentorProfileMe | null> {
  try {
    return await apiFetch<MentorProfileMe>("/api/v1/mentors/me");
  } catch {
    return null;
  }
}
