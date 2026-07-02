import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { apiFetch } from "@/shared/api/client";
import { DeckEditor } from "@/features/pitch-editor";
import type { PitchData } from "@/features/pitch-editor";

export const metadata: Metadata = { title: "Éditer le deck" };

export default async function PitchEditPage() {
  let pitch: PitchData | null = null;
  try {
    pitch = await apiFetch<PitchData>("/api/v1/pitch");
  } catch {
    // serveur indisponible
  }

  // Pas encore de deck → on renvoie vers la page de démarrage.
  if (pitch && (pitch.slides?.length ?? 0) === 0) {
    redirect("/dashboard/pitch");
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Ton deck</h1>
        <p className="text-muted-foreground">
          Édite chaque slide, réorganise, change de thème — puis exporte ou présente.
        </p>
      </div>

      {pitch ? (
        <DeckEditor initial={pitch} />
      ) : (
        <p className="text-sm text-destructive">Impossible de charger ton deck. Réessaie.</p>
      )}
    </div>
  );
}
