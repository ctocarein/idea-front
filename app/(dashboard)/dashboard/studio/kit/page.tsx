import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { BrandKit, getKit, type KitData } from "@/features/studio";

export const metadata: Metadata = { title: "Kit de marque · Studio" };
export const dynamic = "force-dynamic";

export default async function KitPage() {
  let kit: KitData | null = null;
  try {
    kit = await getKit();
  } catch {
    // serveur indisponible
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href={routes.studio} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Studio
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Kit de marque</h1>
        <p className="text-muted-foreground">
          Les couleurs et la typographie de ta marque — dérivées de ton logo, appliquées à ton deck.
        </p>
      </div>

      {kit ? (
        <BrandKit kit={kit} logoRoute={`${routes.studio}/logo`} deckRoute={routes.pitchEditor} />
      ) : (
        <p className="text-sm text-destructive">Impossible de charger le kit. Réessaie.</p>
      )}
    </div>
  );
}
