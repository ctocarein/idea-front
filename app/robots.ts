import type { MetadataRoute } from "next";

import { site } from "@/shared/config/site";

/**
 * robots.txt : on autorise le public, on exclut les espaces privés (auth-gated),
 * les pages d'auth et les liens de partage par token. Sitemap déclaré.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*/dashboard",
        "/*/admin",
        "/*/mentor",
        "/*/login",
        "/*/register",
        "/*/onboarding",
        "/*/verify-email",
        "/*/403",
        "/*/shared/",
        "/api/",
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
