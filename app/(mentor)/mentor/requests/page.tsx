import type { Metadata } from "next";

import { MentorRequests } from "@/features/mentors";

export const metadata: Metadata = { title: "Demandes" };

export default function MentorRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Demandes de mise en relation
        </h1>
        <p className="text-muted-foreground">
          Accepte ou refuse les porteurs qui te sollicitent.
        </p>
      </div>
      <MentorRequests />
    </div>
  );
}
