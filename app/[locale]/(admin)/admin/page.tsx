import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ApiError } from "@/shared/api/client";
import { AdminOverview } from "@/features/instrumentation";
import { getLearningDashboard, type LearningDashboard } from "@/features/analytics";

export const metadata: Metadata = { title: "Vue d'ensemble" };

export default async function AdminHomePage() {
  const t = await getTranslations("Admin.overview");

  // Backend KO ou rôle sans accès → état vide assumé, jamais de chiffre inventé.
  let data: LearningDashboard | null = null;
  try {
    data = await getLearningDashboard();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <AdminOverview data={data} />
    </div>
  );
}
