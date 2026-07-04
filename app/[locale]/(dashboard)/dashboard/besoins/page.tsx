import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { apiFetch } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { SectionTabs } from "@/shared/layout";
import { NeedFichesBoard } from "@/features/academy";
import type { NeedFicheData } from "@/features/academy/actions";

export const metadata: Metadata = { title: "Mes besoins · Workshop" };

export default async function BesoinsPage() {
  const t = await getTranslations("Workshop");
  const WORKSHOP_TABS = [
    { href: routes.academy, label: t("tabs.progress") },
    { href: routes.besoins, label: t("tabs.needs") },
  ];
  let fiches: NeedFicheData[] = [];
  try {
    fiches = await apiFetch<NeedFicheData[]>("/api/v1/academy/my-fiches");
  } catch {
    // dégradé : on affiche la page avec l'état vide
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("needsSubtitle")}
          </p>
        </div>
        <SectionTabs tabs={WORKSHOP_TABS} />
      </div>

      <NeedFichesBoard initial={fiches} />
    </div>
  );
}
