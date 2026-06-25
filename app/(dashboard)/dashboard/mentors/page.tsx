import type { Metadata } from "next";

import { MentorMarketplace } from "@/features/mentors";

export const metadata: Metadata = { title: "Mentors" };

export default function DashboardMentorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Trouve ton mentor
        </h1>
        <p className="text-muted-foreground">
          Parcours et choisis un mentor par secteur. La mise en relation est
          gratuite.
        </p>
      </div>
      <MentorMarketplace />
    </div>
  );
}
