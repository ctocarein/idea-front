import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { apiFetch } from "@/shared/api/client";
import { WeaknessCards } from "@/features/academy/components/WeaknessCards";
import { AcademyModules } from "@/features/academy";
import type { WeaknessListData } from "@/features/academy/actions";

export const metadata: Metadata = { title: "Academy" };

export default async function AcademyPage({
  searchParams,
}: {
  searchParams: { topic?: string };
}) {
  const highlightTopic = searchParams?.topic;

  let weaknessData: WeaknessListData = {
    weaknesses: [],
    dimensions_worked: 0,
    has_radar: false,
  };

  try {
    weaknessData = await apiFetch<WeaknessListData>("/api/v1/academy/my-weaknesses");
  } catch {
    // dégradé : on affiche quand même la page
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Academy</h1>
        <p className="text-muted-foreground">
          Comprends ton projet, renforce tes faiblesses, exprime tes besoins.
        </p>
      </div>

      {/* Section principale : faiblesses Radar */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight">
            Tes axes à renforcer
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Détectés par ton bilan Radar — choisis par où commencer.
          </p>
        </div>
        <WeaknessCards data={weaknessData} />
      </section>

      {/* Section secondaire : ressources pédagogiques */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-bold tracking-tight">
            Ressources pédagogiques
          </h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          Approfondis tes connaissances sur les concepts clés de l&apos;entrepreneuriat.
        </p>
        <AcademyModules highlightTopic={highlightTopic} />
      </section>
    </div>
  );
}
