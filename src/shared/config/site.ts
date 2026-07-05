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

/** Rôles RBAC (miroir UI du backend ; le backend reste la vraie barrière). */
export const ROLES = ["founder", "mentor", "analyst", "admin"] as const;
export type Role = (typeof ROLES)[number];
