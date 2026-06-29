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

// --- Demandes mentor (V1-07) ---

export interface MentorRequestDetail {
  id: string;
  status: string;
  message: string;
  mentor_user_id: string;
  mentor_name: string;
  founder_id: string;
  founder_name: string;
  project_id: string | null;
  session_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Porteur : ses demandes envoyées. */
export async function getMyMentorRequests(): Promise<MentorRequestDetail[]> {
  return apiFetch<MentorRequestDetail[]>("/api/v1/me/mentor-requests");
}

/** Mentor : demandes reçues. */
export async function getMentorIncomingRequests(): Promise<MentorRequestDetail[]> {
  return apiFetch<MentorRequestDetail[]>("/api/v1/mentors/me/requests");
}
