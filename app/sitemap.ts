import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { site } from "@/shared/config/site";

/** Pages publiques indexables (chemins locale-agnostiques). */
const PUBLIC_PATHS = [
  "/",
  "/startups",
  "/financeurs",
  "/diagnostic",
  "/blog",
  "/contact",
  "/legal/mentions",
  "/legal/confidentialite",
  "/legal/cgv",
];

function abs(locale: string, path: string): string {
  return `${site.url}/${locale}${path === "/" ? "" : path}`;
}

/**
 * Sitemap bilingue : une entrée par (locale × page), chaque entrée déclarant
 * ses alternances hreflang → Google relie les versions FR/EN d'une même page.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const path of PUBLIC_PATHS) {
    const languages: Record<string, string> = {};
    for (const l of routing.locales) languages[l] = abs(l, path);
    for (const locale of routing.locales) {
      entries.push({
        url: abs(locale, path),
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : path === "/diagnostic" ? 0.9 : 0.7,
        alternates: { languages },
      });
    }
  }
  return entries;
}
