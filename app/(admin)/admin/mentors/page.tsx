import type { Metadata } from "next";

import { ApiError } from "@/shared/api/client";
import { MentorCuration } from "@/features/mentors";
import { getMentorApplications, getMentors } from "@/features/mentors/api";

export const metadata: Metadata = { title: "Mentors" };

export default async function AdminMentorsPage() {
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Mentors</h1>
        <p className="text-muted-foreground">
          Le garde-fou qualité : examine les candidatures, gère les comptes.
        </p>
      </div>
      <MentorCuration applications={applications} mentors={mentors} />
    </div>
  );
}
