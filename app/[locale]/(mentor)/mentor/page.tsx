import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { MentorProfile } from "@/features/mentors";

export const metadata: Metadata = { title: "Mon profil" };

export default function MentorHomePage() {
  const t = useTranslations("Mentor.home");
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
      <MentorProfile />
    </div>
  );
}
