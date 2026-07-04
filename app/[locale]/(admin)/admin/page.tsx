import type { Metadata } from "next";

import { LearningDashboard } from "@/features/instrumentation";

export const metadata: Metadata = { title: "Vue d'ensemble" };

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Tableau d&apos;apprentissage
        </h1>
        <p className="text-muted-foreground">
          La métrique nord : la transformation, pas le revenu.
        </p>
      </div>
      <LearningDashboard />
    </div>
  );
}
