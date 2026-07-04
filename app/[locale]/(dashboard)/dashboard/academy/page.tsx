import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { apiFetch } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { SectionTabs } from "@/shared/layout";
import { WeaknessCards } from "@/features/academy";
import type { WeaknessListData } from "@/features/academy/actions";

export const metadata: Metadata = { title: "Workshop" };

export default async function AcademyPage() {
  const t = await getTranslations("Workshop");
  const WORKSHOP_TABS = [
    { href: routes.academy, label: t("tabs.progress") },
    { href: routes.besoins, label: t("tabs.needs") },
  ];
  let weaknessData: WeaknessListData = {
    weaknesses: [],
    dimensions_worked: 0,
    dimensions_reinforced: 0,
    reinforced_dimensions: [],
    has_radar: false,
  };

  try {
    weaknessData = await apiFetch<WeaknessListData>("/api/v1/academy/my-weaknesses");
  } catch {
    // dégradé : on affiche quand même la page
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("progressSubtitle")}
          </p>
        </div>
        <SectionTabs tabs={WORKSHOP_TABS} />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight">
            {t("axesTitle")}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("axesSubtitle")}
          </p>
        </div>
        <WeaknessCards data={weaknessData} />
      </section>
    </div>
  );
}
