import type { Metadata } from "next";

import { apiFetch } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { SectionTabs } from "@/shared/layout";
import { ProfileEditClient } from "@/features/iam/ProfileEditClient";

export const metadata: Metadata = { title: "Mon profil" };

const PROFILE_TABS = [
  { href: routes.profile, label: "Profil" },
  { href: routes.shares, label: "Partages" },
];

interface MeOut {
  user: {
    full_name: string;
    email: string;
    country: string | null;
    city: string | null;
    professional_status: string | null;
    project_stage: string | null;
    weekly_availability: string | null;
  };
}

export default async function ProfilePage() {
  let me: MeOut | null = null;
  try {
    me = await apiFetch<MeOut>("/api/v1/auth/me");
  } catch {
    // garde dégradé
  }

  if (!me) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Mon profil</h1>
        <p className="text-muted-foreground">Impossible de charger le profil.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Mon profil</h1>
          <p className="text-muted-foreground">
            Mets à jour tes informations personnelles et la situation de ton projet.
          </p>
        </div>
        <SectionTabs tabs={PROFILE_TABS} />
      </div>
      <ProfileEditClient profile={me.user} />
    </div>
  );
}
