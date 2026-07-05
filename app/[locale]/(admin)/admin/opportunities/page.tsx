import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ApiError } from "@/shared/api/client";
import { getAdminOpportunities, OpportunitiesAdminClient } from "@/features/opportunities";

export const metadata: Metadata = { title: "Opportunités" };

export default async function AdminOpportunitiesPage() {
  const t = await getTranslations("Admin.opportunities");
  let opportunities: Awaited<ReturnType<typeof getAdminOpportunities>> = [];
  try {
    opportunities = await getAdminOpportunities();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>
      <OpportunitiesAdminClient initialOpportunities={opportunities} />
    </div>
  );
}
