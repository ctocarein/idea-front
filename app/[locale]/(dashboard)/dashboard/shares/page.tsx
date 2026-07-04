import type { Metadata } from "next";

import { apiFetch } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { SectionTabs } from "@/shared/layout";
import { SharesDashboard, type ShareStats, type ProjectVisibility } from "@/features/sharing/SharesDashboard";

export const metadata: Metadata = { title: "Partages · Mon profil" };

const PROFILE_TABS = [
  { href: routes.profile, label: "Profil" },
  { href: routes.shares, label: "Partages" },
];

export default async function SharesPage() {
  let shares: ShareStats[] = [];
  let visibility: ProjectVisibility | null = null;
  try {
    [shares, visibility] = await Promise.all([
      apiFetch<ShareStats[]>("/api/v1/me/shares"),
      apiFetch<ProjectVisibility | null>("/api/v1/me/project-visibility").catch(() => null),
    ]);
  } catch {
    // état dégradé
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Mon profil</h1>
          <p className="text-muted-foreground">
            Visibilité du projet, liens de partage actifs et statistiques de vues.
          </p>
        </div>
        <SectionTabs tabs={PROFILE_TABS} />
      </div>
      <SharesDashboard shares={shares} projectVisibility={visibility} />
    </div>
  );
}
