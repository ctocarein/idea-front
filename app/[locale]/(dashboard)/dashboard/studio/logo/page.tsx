import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { LogoStudio, getLogo, type LogoData } from "@/features/studio";

export const metadata: Metadata = { title: "Logo & identité · Studio" };

export const dynamic = "force-dynamic";

export default async function LogoPage() {
  let logo: LogoData | null = null;
  try {
    logo = await getLogo();
  } catch {
    // serveur indisponible
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href={routes.studio} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Studio
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Logo &amp; identité</h1>
        <p className="text-muted-foreground">
          Une marque vectorielle sur mesure — l&apos;IA propose, tu ajustes chaque détail.
        </p>
      </div>

      {logo ? (
        <LogoStudio initial={logo} />
      ) : (
        <p className="text-sm text-destructive">Impossible de charger le Studio. Réessaie.</p>
      )}
    </div>
  );
}
