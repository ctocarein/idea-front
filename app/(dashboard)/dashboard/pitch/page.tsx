import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { apiFetch } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { PitchStart } from "@/features/pitch-editor";
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
    <div className="space-y-6 max-w-3xl">
      <Link href={routes.studio} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Studio
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Préparer ta présentation</h1>
        <p className="text-muted-foreground">
          Un deck visuel, prêt à pitcher. Choisis par où commencer — l&apos;IA fait le premier jet,
          tu gardes la main.
        </p>
      </div>

      {pitch ? (
        <PitchStart initial={pitch} />
      ) : (
        <p className="text-sm text-destructive">
          Impossible de charger ton pitch. Vérifie ta connexion et réessaie.
        </p>
      )}
    </div>
  );
}
