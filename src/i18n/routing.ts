import { defineRouting } from "next-intl/routing";

/** Configuration i18n — bilingue FR/EN, préfixe d'URL toujours présent (/fr, /en). */
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
