import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { ApiError } from "@/shared/api/client";
import { Card, CardContent } from "@/shared/ui";
import { getMyProjectId } from "@/features/reports/api";
import { getOpportunities, OpportunityCard, type Opportunity } from "@/features/opportunities";
import { NewDiagnosticModal } from "@/features/diagnostics";

export const metadata: Metadata = { title: "Opportunités" };

export default async function OpportunitesPage() {
  const projectId = await getMyProjectId();
  const t = await getTranslations("Opportunities");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {projectId ? (
        <OpportunitiesList projectId={projectId} />
      ) : (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-8">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">
                {t("emptyDiagTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("emptyDiagText")}
              </p>
            </div>
            <NewDiagnosticModal>
              {t("emptyDiagCta")}
              <ArrowRight className="size-4" />
            </NewDiagnosticModal>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

async function OpportunitiesList({ projectId }: { projectId: string }) {
  const t = await getTranslations("Opportunities");
  let opportunities: Opportunity[] = [];
  try {
    opportunities = await getOpportunities(projectId);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  if (opportunities.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          {t("none")}
        </CardContent>
      </Card>
    );
  }

  const eligible = opportunities.filter((o) => o.eligible);
  const locked = opportunities.filter((o) => !o.eligible);

  return (
    <div className="space-y-8">
      {eligible.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold tracking-tight">
            {t("forYou")}
            <span className="ml-2 text-sm font-medium text-muted-foreground">
              {eligible.length}
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {eligible.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} projectId={projectId} />
            ))}
          </div>
        </section>
      ) : null}

      {locked.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold tracking-tight">
            {t("toUnlock")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {locked.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} projectId={projectId} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
