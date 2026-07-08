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
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
      { src: "/apple-icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
