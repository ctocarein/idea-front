import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AdjustProjectClient } from "@/features/diagnostics";

export const metadata: Metadata = { title: "Relire mon projet" };

export default async function AjusterPage() {
  const t = await getTranslations("Diagnostic.adjust");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <AdjustProjectClient />
    </div>
  );
}
