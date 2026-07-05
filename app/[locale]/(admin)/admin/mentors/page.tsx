import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ApiError } from "@/shared/api/client";
import { MentorCuration } from "@/features/mentors";
import { getMentorApplications, getMentors } from "@/features/mentors/api";

export const metadata: Metadata = { title: "Mentors" };

export default async function AdminMentorsPage() {
  const t = await getTranslations("Admin.mentors");
  let applications: Awaited<ReturnType<typeof getMentorApplications>> = [];
  let mentors: Awaited<ReturnType<typeof getMentors>> = [];
  try {
    [applications, mentors] = await Promise.all([getMentorApplications(), getMentors()]);
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
      <MentorCuration applications={applications} mentors={mentors} />
    </div>
  );
}
