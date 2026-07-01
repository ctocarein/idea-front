import type { Metadata } from "next";

import { apiFetch } from "@/shared/api/client";
import { PitchEditor, DeckPanel } from "@/features/pitch-editor";
import type { PitchData } from "@/features/pitch-editor";

export const metadata: Metadata = { title: "Pitch" };

export default async function PitchPage() {
  let pitch: PitchData | null = null;
  try {
    pitch = await apiFetch<PitchData>("/api/v1/pitch");
  } catch {
    // serveur indisponible
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Ton pitch</h1>
        <p className="text-muted-foreground">
          Rédige ton pitch section par section. L&apos;IA te propose un premier jet à partir de
          ton travail dans le Workshop — tu gardes la main sur chaque mot.
        </p>
      </div>

      {pitch ? (
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold tracking-tight">Ton deck</h2>
            <DeckPanel initial={pitch} />
          </section>
          <section className="space-y-3">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">Le contenu, section par section</h2>
              <p className="text-sm text-muted-foreground">La substance de ton pitch — le deck s&apos;en nourrit.</p>
            </div>
            <PitchEditor initial={pitch} />
          </section>
        </div>
      ) : (
        <p className="text-sm text-destructive">
          Impossible de charger ton pitch. Vérifie ta connexion et réessaie.
        </p>
      )}
    </div>
  );
}
