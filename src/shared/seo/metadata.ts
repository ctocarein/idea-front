/**
 * Helpers SEO — metadata localisée + alternances hreflang (bilingue FR/EN).
 *
 * Le `metadataBase` est posé dans le root layout → tous les chemins relatifs
 * ci-dessous sont résolus en URLs absolues (canonical, hreflang, og:url).
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { OG_LOCALE, site } from "@/shared/config/site";

/** Chemin localisé propre : "/" → "" pour éviter les doubles slashes. */
function localizedPath(locale: string, path: string): string {
  return `/${locale}${path === "/" ? "" : path}`;
}

/**
 * Alternates hreflang (fr, en, x-default) + canonical pour un chemin
 * locale-agnostique (ex. "/startups"). Relatif → résolu via metadataBase.
 */
export function alternates(locale: string, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {
    "x-default": localizedPath(routing.defaultLocale, path),
  };
  for (const l of routing.locales) languages[l] = localizedPath(l, path);
  return { canonical: localizedPath(locale, path), languages };
}

/** URL (relative, résolue via metadataBase) de l'image OG de marque localisée. */
export function ogImage(locale: string): string {
  return `/${locale}/opengraph-image`;
}

/** Bloc Open Graph localisé, cohérent pour une page publique. */
export function openGraph(
  locale: string,
  path: string,
  title: string,
  description: string,
): Metadata["openGraph"] {
  return {
    title,
    description,
    url: localizedPath(locale, path),
    siteName: site.name,
    locale: OG_LOCALE[locale],
    alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    type: "website",
    images: [{ url: ogImage(locale), width: 1200, height: 630, alt: site.name }],
  };
}

/**
 * Metadata SEO complète d'une page publique indexable.
 * Titre + description tirés du namespace `Seo` ; hreflang + OG + canonical.
 */
export async function pageMetadata({
  locale,
  path,
  seoKey,
  absoluteTitle = false,
}: {
  locale: string;
  path: string;
  seoKey: string;
  /** true → titre non préfixé par le gabarit « %s · Ideaxion » (ex. accueil). */
  absoluteTitle?: boolean;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Seo" });
  const title = t(`${seoKey}.title`);
  const description = t(`${seoKey}.description`);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: alternates(locale, path),
    openGraph: openGraph(locale, path, title, description),
  };
}
