import type { components } from "@/shared/api/schema";

/**
 * Métadonnées de marque, centralisées (i18n-ready : pas de chaîne dispersée).
 *
 * `url` = domaine canonique du portail (SEO : metadataBase, hreflang, sitemap,
 * canonical, Open Graph). ideaxion.pro = portail officiel ; ideaxion.cloud = API.
 * Surchargeable en prod via NEXT_PUBLIC_SITE_URL (ex. staging).
 */
export const site = {
  name: "Ideaxion",
  tagline: "Deviens capable et confiant.",
  description:
    "Comprends ton projet, apprends, entraîne-toi à pitcher — puis, quand tu es prêt, relie-toi au capital.",
  locale: "fr",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ideaxion.pro").replace(/\/+$/, ""),
} as const;

/** Codes Open Graph par locale (og:locale). */
export const OG_LOCALE: Record<string, string> = { fr: "fr_FR", en: "en_US" };

/**
 * Rôles RBAC — dérivés de l'OpenAPI backend, jamais recopiés : le backend reste la
 * seule autorité (et la vraie barrière ; ici c'est du cosmétique d'affichage).
 * Inclut `investor`, que le backend sait émettre même si son espace est différé en v2.
 */
export type Role = components["schemas"]["Role"];
