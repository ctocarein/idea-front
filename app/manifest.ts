import type { MetadataRoute } from "next";

import { site } from "@/shared/config/site";

/** Web App Manifest (PWA / « ajouter à l'écran d'accueil »). Fichier unique (FR par défaut). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    lang: "fr",
    background_color: "#ffffff",
    theme_color: "#ea5a2c",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
