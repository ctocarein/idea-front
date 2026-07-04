import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Newspaper } from "lucide-react";

import { EmptyState } from "@/shared/ui";

export const metadata: Metadata = { title: "Blog" };

export default function BlogPage() {
  const t = useTranslations("Public.blog");
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
        {t("title")}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {t("subtitle")}
      </p>
      <div className="mt-8">
        <EmptyState
          icon={Newspaper}
          title={t("emptyTitle")}
          description={t("emptyText")}
        />
      </div>
    </div>
  );
}
