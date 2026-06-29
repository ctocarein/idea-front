import type { Metadata } from "next";

import { apiFetch } from "@/shared/api/client";
import { SharesDashboard, type ShareStats } from "@/features/sharing/SharesDashboard";

export const metadata: Metadata = { title: "Mes partages" };

export default async function SharesPage() {
  let shares: ShareStats[] = [];
  try {
    shares = await apiFetch<ShareStats[]>("/api/v1/me/shares");
  } catch {
    // état dégradé : liste vide
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Mes partages</h1>
        <p className="text-muted-foreground">
          Liens de partage actifs, statistiques de vues et gestion de l&apos;accès.
        </p>
      </div>
      <SharesDashboard shares={shares} />
    </div>
  );
}
