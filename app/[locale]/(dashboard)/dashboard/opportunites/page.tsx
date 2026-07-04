import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { ApiError } from "@/shared/api/client";
import { Button, Card, CardContent } from "@/shared/ui";
import { getMyProjectId } from "@/features/reports/api";
import { getOpportunities, OpportunityCard, type Opportunity } from "@/features/opportunities";

export const metadata: Metadata = { title: "Opportunités" };

export default async function OpportunitesPage() {
  const projectId = await getMyProjectId();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Opportunités</h1>
        <p className="text-muted-foreground">
          Programmes, concours et incubateurs — filtrés selon la solidité de ton projet.
        </p>
      </div>

      {projectId ? (
        <OpportunitiesList projectId={projectId} />
      ) : (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-8">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">
                Lance d&apos;abord ton diagnostic
              </h2>
              <p className="text-sm text-muted-foreground">
                Les opportunités s&apos;ouvrent en fonction de la maturité de ton projet.
              </p>
            </div>
            <Button asChild>
              <Link href={routes.diagnostic}>
                Commencer mon diagnostic
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

async function OpportunitiesList({ projectId }: { projectId: string }) {
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
          Aucune opportunité pour le moment. Reviens bientôt — on en ajoute régulièrement.
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
            Pour toi maintenant
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
            À débloquer en renforçant ton projet
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
