import type { Metadata } from "next";

import { ApiError } from "@/shared/api/client";
import { PitchBriefing } from "@/features/pitch-simulator";
import { getCommittees } from "@/features/pitch-simulator/api";
import { getMyProjectId } from "@/features/reports/api";

export const metadata: Metadata = { title: "Simulateur de pitch" };

export default async function PitchSimPage() {
  let committees: Awaited<ReturnType<typeof getCommittees>> = [];
  let projectId: string | null = null;
  try {
    [committees, projectId] = await Promise.all([getCommittees(), getMyProjectId()]);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Simulateur de pitch</h1>
        <p className="text-muted-foreground">
          Affronte un comité virtuel — sans jugement, sans enjeu. Rejoue autant que tu veux.
        </p>
      </div>

      <PitchBriefing committees={committees} projectId={projectId} />
    </div>
  );
}
