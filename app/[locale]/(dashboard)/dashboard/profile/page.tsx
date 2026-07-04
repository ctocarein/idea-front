import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { apiFetch } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { SectionTabs } from "@/shared/layout";
import { ProfileEditClient } from "@/features/iam";

export const metadata: Metadata = { title: "Mon profil" };

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
  const t = await getTranslations("Profile");
  const PROFILE_TABS = [
    { href: routes.profile, label: t("tabs.profile") },
    { href: routes.shares, label: t("tabs.shares") },
  ];
  let me: MeOut | null = null;
  try {
    me = await apiFetch<MeOut>("/api/v1/auth/me");
  } catch {
    // garde dégradé
  }

  if (!me) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("loadError")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <SectionTabs tabs={PROFILE_TABS} />
      </div>
      <ProfileEditClient profile={me.user} />
    </div>
  );
}
