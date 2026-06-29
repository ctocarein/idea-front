"use server";

import { apiFetch } from "@/shared/api/client";

export interface ProfileFormData {
  country: string;
  city: string;
  professional_status: string;
  project_stage: string;
  weekly_availability: string;
}

export type ProfileResult =
  | { ok: true }
  | { ok: false; message: string };

export async function updateProfile(data: Partial<ProfileFormData>): Promise<ProfileResult> {
  try {
    await apiFetch("/api/v1/auth/me/profile", {
      method: "PATCH",
      json: {
        country:              data.country              || null,
        city:                 data.city                 || null,
        professional_status:  data.professional_status  || null,
        project_stage:        data.project_stage        || null,
        weekly_availability:  data.weekly_availability  || null,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, message: "Mise à jour impossible. Réessaie." };
  }
}
