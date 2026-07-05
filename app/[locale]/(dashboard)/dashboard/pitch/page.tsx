import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { PitchStart } from "@/features/pitch-editor";
import type { PitchData } from "@/features/pitch-editor";

export const metadata: Metadata = { title: "Pitch" };

export default async function PitchPage() {
  const t = await getTranslations("Pitch");
  let pitch: PitchData | null = null;
  try {
    pitch = await apiFetch<PitchData>("/api/v1/pitch");
  } catch {
    // serveur indisponible
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href={routes.studio} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t("back")}
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("startTitle")}</h1>
        <p className="text-muted-foreground">
          {t("startSubtitle")}
        </p>
      </div>

      {pitch ? (
        <PitchStart initial={pitch} />
      ) : (
        <p className="text-sm text-destructive">
          {t("loadError")}
        </p>
      )}
    </div>
  );
}
