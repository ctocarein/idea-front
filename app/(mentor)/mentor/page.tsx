import type { Metadata } from "next";

import { MentorProfile } from "@/features/mentors";

export const metadata: Metadata = { title: "Mon profil" };

export default function MentorHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Mon profil mentor
        </h1>
        <p className="text-muted-foreground">
          Ton profil dans la marketplace — secteurs, agenda, honoraires.
        </p>
      </div>
      <MentorProfile />
    </div>
  );
}
