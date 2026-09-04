import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { apiFetch } from "@/shared/api/client";
import { features } from "@/shared/config/features";
import { routes } from "@/shared/config/routes";
import { DeckEditor } from "@/features/pitch-editor";
import type { PitchData } from "@/features/pitch-editor";

export const metadata: Metadata = { title: "Éditer le deck" };

export default async function PitchEditPage() {
  if (!features.pitchEditor) redirect(routes.dashboard);

  const t = await getTranslations("Pitch");
  let pitch: PitchData | null = null;
  try {
    pitch = await apiFetch<PitchData>("/api/v1/pitch");
  } catch {
    // serveur indisponible
  }

  // Pas encore de deck → on renvoie vers la page de démarrage.
  if (pitch && (pitch.slides?.length ?? 0) === 0) {
    redirect(routes.pitchEditor);
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("editTitle")}</h1>
        <p className="text-muted-foreground">
          {t("editSubtitle")}
        </p>
      </div>

      {pitch ? (
        <DeckEditor initial={pitch} />
      ) : (
        <p className="text-sm text-destructive">{t("editLoadError")}</p>
      )}
    </div>
  );
}
