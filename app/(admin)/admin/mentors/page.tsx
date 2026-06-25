import type { Metadata } from "next";

import { MentorCuration } from "@/features/mentors";

export const metadata: Metadata = { title: "Mentors" };

export default function AdminMentorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Mentors
        </h1>
        <p className="text-muted-foreground">
          Le garde-fou qualité : examine les candidatures, gère les comptes.
        </p>
      </div>
      <MentorCuration />
    </div>
  );
}
