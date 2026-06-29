import type { Metadata } from "next";

import { AcademyModules, GuidedBuilder } from "@/features/academy";

export const metadata: Metadata = { title: "Academy" };

export default function AcademyPage({ searchParams }: { searchParams: { topic?: string } }) {
  const highlightTopic = searchParams?.topic;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Academy
        </h1>
        <p className="text-muted-foreground">
          Comprends comment se structure un projet — puis construis ta version,
          guidé.
        </p>
      </div>

      <AcademyModules highlightTopic={highlightTopic} />

      <section id="construire" className="space-y-3 scroll-mt-20">
        <h2 className="font-display text-lg font-bold tracking-tight">
          Construire ma version
        </h2>
        <p className="text-sm text-muted-foreground">
          Ici, tu écris. L&apos;assistant t&apos;explique et te questionne — il ne
          fait jamais à ta place.
        </p>
        <GuidedBuilder />
      </section>
    </div>
  );
}
