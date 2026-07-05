import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { LearningDashboard } from "@/features/instrumentation";

export const metadata: Metadata = { title: "Vue d'ensemble" };

export default function AdminHomePage() {
  const t = useTranslations("Admin.overview");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>
      <LearningDashboard />
    </div>
  );
}
