import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { fontVariables } from "@/shared/styles/fonts";
import { AppProviders } from "@/shared/providers/app-providers";
import { routing } from "@/i18n/routing";
import { OG_LOCALE, site } from "@/shared/config/site";
import { ogImage } from "@/shared/seo/metadata";
import "../globals.css";

/** Metadata racine, localisée : metadataBase + gabarit de titre + défauts OG/Twitter/robots. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo" });
  return {
    metadataBase: new URL(site.url),
    title: { default: t("default.title"), template: `%s · ${site.name}` },
    description: t("default.description"),
    applicationName: site.name,
    openGraph: {
      siteName: site.name,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      type: "website",
      images: [{ url: ogImage(locale), width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: "summary_large_image", images: [ogImage(locale)] },
    robots: { index: true, follow: true },
  };
}

/** Pré-rend les deux locales (rendu statique). */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${fontVariables} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:font-medium focus:shadow-[var(--shadow-card)] focus:ring-4 focus:ring-ring/25"
        >
          {locale === "en" ? "Skip to main content" : "Aller au contenu principal"}
        </a>
        <NextIntlClientProvider>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
