import type { Metadata } from "next";

import { ApiError } from "@/shared/api/client";
import { getAdminOpportunities } from "@/features/opportunities/adminApi";
import { OpportunitiesAdminClient } from "@/features/opportunities/OpportunitiesAdminClient";

export const metadata: Metadata = { title: "Opportunités" };

export default async function AdminOpportunitiesPage() {
  let opportunities: Awaited<ReturnType<typeof getAdminOpportunities>> = [];
  try {
    opportunities = await getAdminOpportunities();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Opportunités</h1>
        <p className="text-muted-foreground">
          Catalogue des concours, hackathons, incubateurs et financements proposés aux porteurs.
        </p>
      </div>
      <OpportunitiesAdminClient initialOpportunities={opportunities} />
    </div>
  );
}
