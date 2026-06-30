import type { Metadata } from "next";

import { apiFetch } from "@/shared/api/client";
import { SharesDashboard, type ShareStats, type ProjectVisibility } from "@/features/sharing/SharesDashboard";

export const metadata: Metadata = { title: "Mes partages" };

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
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Mes partages</h1>
        <p className="text-muted-foreground">
          Visibilité du projet, liens de partage actifs et statistiques de vues.
        </p>
      </div>
      <SharesDashboard shares={shares} projectVisibility={visibility} />
    </div>
  );
}
