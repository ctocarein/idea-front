import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { routes } from "@/shared/config/routes";
import { pageMetadata } from "@/shared/seo/metadata";

const LEGAL_DOCS = ["mentions", "confidentialite", "cgv"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; doc: string }>;
}): Promise<Metadata> {
  const { locale, doc } = await params;
  if (LEGAL_DOCS.includes(doc)) {
    return pageMetadata({ locale, path: routes.legal(doc), seoKey: `legal.${doc}` });
  }
  // Doc inconnu → titre générique, non indexé.
  const t = await getTranslations("Public.legal");
  return { title: t("fallbackTitle"), robots: { index: false } };
}

/* En Next 16, `params` est asynchrone. Contenu juridique réel au Sprint D6/OPS. */
export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const t = await getTranslations("Public.legal");
  const title = t.has(`docs.${doc}`) ? t(`docs.${doc}`) : t("fallbackTitle");
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {t("body")}
      </p>
    </div>
  );
}
