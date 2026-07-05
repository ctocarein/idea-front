/**
 * Données structurées JSON-LD (schema.org) — rich results Google.
 * Organization (entité/knowledge panel) + WebSite (sitelinks). Localisées.
 */
import { site } from "@/shared/config/site";

function inLanguage(locale: string): string {
  return locale === "en" ? "en-US" : "fr-FR";
}

/** Graph JSON-LD (Organization + WebSite) pour une locale donnée. */
export function structuredData(locale: string, description: string): object {
  const url = `${site.url}/${locale}`;
  const logo = `${site.url}/icon`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        url: site.url,
        logo,
        description,
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        url,
        inLanguage: inLanguage(locale),
        description,
        publisher: { "@id": `${site.url}/#organization` },
      },
    ],
  };
}
