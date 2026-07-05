import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { pageMetadata } from "@/shared/seo/metadata";
import { Button } from "@/shared/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({ locale, path: routes.financeurs, seoKey: "financiers" });
}

export default function FinanceursPage() {
  const t = useTranslations("Public.financiers");
  const value = [t("value1"), t("value2"), t("value3")];
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <span className="flex size-12 items-center justify-center rounded-full bg-dawn text-ink">
        <ShieldCheck className="size-6" />
      </span>
      <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {t("subtitle")}
      </p>

      <ul className="mt-8 space-y-3">
        {value.map((v) => (
          <li key={v} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
            <span>{v}</span>
          </li>
        ))}
      </ul>

      <p className="mt-8 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        {t("note")}
      </p>

      <div className="mt-8">
        <Button asChild>
          <Link href={routes.contact}>{t("cta")}</Link>
        </Button>
      </div>
    </div>
  );
}
