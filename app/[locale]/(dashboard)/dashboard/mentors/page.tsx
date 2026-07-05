import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ApiError } from "@/shared/api/client";
import { features } from "@/shared/config/features";
import { routes } from "@/shared/config/routes";
import { MentorMarketplace, MyMentorRequests } from "@/features/mentors";
import { getMentors, getMyMentorRequests } from "@/features/mentors/api";
import { getMyProjectId } from "@/features/reports/api";

export const metadata: Metadata = { title: "Mentors" };

export default async function DashboardMentorsPage() {
  if (!features.mentors) redirect(routes.dashboard);
  const t = await getTranslations("Mentor.discovery");

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
            <h2 className="font-display text-xl font-bold tracking-tight">{t("myRequestsTitle")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("myRequestsSubtitle")}
            </p>
          </div>
          <MyMentorRequests initialRequests={myRequests} />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{t("findTitle")}</h1>
          <p className="text-muted-foreground">
            {t("findSubtitle")}
          </p>
        </div>
        <MentorMarketplace mentors={mentors} projectId={projectId} />
      </div>
    </div>
  );
}
