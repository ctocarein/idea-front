import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { ArrowRight, Compass, GraduationCap, Mic, Target } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Pour les startups",
  description: "Comment Ideaxion rend les porteurs capables et confiants.",
};

const JOURNEY = [
  { icon: Compass, key: "understand" },
  { icon: GraduationCap, key: "learn" },
  { icon: Mic, key: "practice" },
  { icon: Target, key: "realize" },
] as const;

export default function StartupsPage() {
  const t = useTranslations("Public.startups");
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
      </header>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {JOURNEY.map(({ icon: Icon, key }) => (
          <div
            key={key}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-coral/15 text-coral-strong">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold">{t(`journey.${key}.title`)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t(`journey.${key}.text`)}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Button asChild>
          <Link href={routes.diagnostic}>
            {t("cta")}
            <ArrowRight className="size-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
