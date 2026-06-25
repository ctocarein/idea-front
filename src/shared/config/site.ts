/**
 * Métadonnées de marque, centralisées (i18n-ready : pas de chaîne dispersée).
 */
export const site = {
  name: "Ideaxion",
  tagline: "Deviens capable et confiant.",
  description:
    "Comprends ton projet, apprends, entraîne-toi à pitcher — puis, quand tu es prêt, relie-toi au capital.",
  locale: "fr",
} as const;

/** Rôles RBAC (miroir UI du backend ; le backend reste la vraie barrière). */
export const ROLES = ["founder", "mentor", "analyst", "admin"] as const;
export type Role = (typeof ROLES)[number];
