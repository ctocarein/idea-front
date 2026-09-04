import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { redirect } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { features } from "@/shared/config/features";
import { routes } from "@/shared/config/routes";
import { BrandKit, getKit, type KitData } from "@/features/studio";

export const metadata: Metadata = { title: "Kit de marque · Studio" };
export const dynamic = "force-dynamic";

export default async function KitPage() {
  if (!features.studio) redirect(routes.dashboard);

  const t = await getTranslations("Studio");
  let kit: KitData | null = null;
  try {
    kit = await getKit();
  } catch {
    // serveur indisponible
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href={routes.studio} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t("back")}
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("kit.pageTitle")}</h1>
        <p className="text-muted-foreground">
          {t("kit.pageSubtitle")}
        </p>
      </div>

      {kit ? (
        <BrandKit kit={kit} logoRoute={`${routes.studio}/logo`} deckRoute={routes.pitchEditor} />
      ) : (
        <p className="text-sm text-destructive">{t("kit.loadError")}</p>
      )}
    </div>
  );
}
