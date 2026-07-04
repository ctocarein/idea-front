import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { LogoStudio, getLogo, type LogoData } from "@/features/studio";

export const metadata: Metadata = { title: "Logo & identité · Studio" };

export const dynamic = "force-dynamic";

export default async function LogoPage() {
  const t = await getTranslations("Studio");
  let logo: LogoData | null = null;
  try {
    logo = await getLogo();
  } catch {
    // serveur indisponible
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href={routes.studio} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t("back")}
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("logo.pageTitle")}</h1>
        <p className="text-muted-foreground">
          {t("logo.pageSubtitle")}
        </p>
      </div>

      {logo ? (
        <LogoStudio initial={logo} />
      ) : (
        <p className="text-sm text-destructive">{t("logo.loadError")}</p>
      )}
    </div>
  );
}
