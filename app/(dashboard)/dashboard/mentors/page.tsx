import type { Metadata } from "next";

import { ApiError } from "@/shared/api/client";
import { MentorMarketplace, MyMentorRequests } from "@/features/mentors";
import { getMentors, getMyMentorRequests } from "@/features/mentors/api";
import { getMyProjectId } from "@/features/reports/api";

export const metadata: Metadata = { title: "Mentors" };

export default async function DashboardMentorsPage() {
  let mentors: Awaited<ReturnType<typeof getMentors>> = [];
  let myRequests: Awaited<ReturnType<typeof getMyMentorRequests>> = [];
  let projectId: string | null = null;
  try {
    [mentors, myRequests, projectId] = await Promise.all([
      getMentors(),
      getMyMentorRequests(),
      getMyProjectId(),
    ]);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <div className="space-y-10">
      {myRequests.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Mes demandes</h2>
            <p className="text-sm text-muted-foreground">
              Suivi en temps réel de tes mises en relation.
            </p>
          </div>
          <MyMentorRequests initialRequests={myRequests} />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Trouve ton mentor</h1>
          <p className="text-muted-foreground">
            Parcours et choisis un mentor par secteur. La mise en relation est gratuite.
          </p>
        </div>
        <MentorMarketplace mentors={mentors} projectId={projectId} />
      </div>
    </div>
  );
}
