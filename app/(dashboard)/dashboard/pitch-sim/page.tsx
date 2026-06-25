import type { Metadata } from "next";

import { PitchProgress, PitchSimulator } from "@/features/pitch-simulator";

export const metadata: Metadata = { title: "Simulateur de pitch" };

export default function PitchSimPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Simulateur de pitch
        </h1>
        <p className="text-muted-foreground">
          Entraîne-toi face à une IA-investisseur. Sans jugement, sans enjeu —
          rejoue autant que tu veux.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <PitchSimulator />
        <PitchProgress />
      </div>
    </div>
  );
}
