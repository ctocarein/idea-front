import type { Metadata } from "next";

import { apiFetch } from "@/shared/api/client";
import { WeaknessCards } from "@/features/academy/components/WeaknessCards";
import type { WeaknessListData } from "@/features/academy/actions";

export const metadata: Metadata = { title: "Workshop" };

export default async function AcademyPage() {
  let weaknessData: WeaknessListData = {
    weaknesses: [],
    dimensions_worked: 0,
    dimensions_reinforced: 0,
    reinforced_dimensions: [],
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Workshop</h1>
        <p className="text-muted-foreground">
          Comprends ton projet, renforce tes faiblesses, exprime tes besoins.
        </p>
      </div>

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
    </div>
  );
}
