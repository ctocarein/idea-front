import type { Metadata } from "next";

import { ApiError } from "@/shared/api/client";
import { MentorMarketplace } from "@/features/mentors";
import { getMentors } from "@/features/mentors/api";
import { getMyProjectId } from "@/features/reports/api";

export const metadata: Metadata = { title: "Mentors" };

export default async function DashboardMentorsPage() {
  let mentors: Awaited<ReturnType<typeof getMentors>> = [];
  let projectId: string | null = null;
  try {
    [mentors, projectId] = await Promise.all([getMentors(), getMyProjectId()]);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Trouve ton mentor</h1>
        <p className="text-muted-foreground">
          Parcours et choisis un mentor par secteur. La mise en relation est gratuite.
        </p>
      </div>
      <MentorMarketplace mentors={mentors} projectId={projectId} />
    </div>
  );
}
