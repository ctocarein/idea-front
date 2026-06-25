import { apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";

/**
 * Simulateur de pitch « comité silencieux » (Sprint INT). Le backend EST la machine à phases ;
 * le front la reflète (briefing → pitching → qa → free_round → deliberating → completed).
 */
export type Committee = components["schemas"]["CommitteeOut"];
export type Persona = components["schemas"]["PersonaOut"];
export type PitchSession = components["schemas"]["SessionOut"];
export type PitchTurn = components["schemas"]["TurnOut"];
export type PostMortem = components["schemas"]["PostMortemOut"];

export async function getCommittees(): Promise<Committee[]> {
  return apiFetch<Committee[]>("/api/v1/pitchsim/committees");
}

export async function getSession(sessionId: string): Promise<PitchSession> {
  return apiFetch<PitchSession>(`/api/v1/pitchsim/sessions/${sessionId}`);
}

export async function getPostMortem(sessionId: string): Promise<PostMortem> {
  return apiFetch<PostMortem>(`/api/v1/pitchsim/sessions/${sessionId}/post-mortem`);
}
