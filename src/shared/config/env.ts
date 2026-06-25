/**
 * Configuration d'environnement côté serveur (Sprint INT).
 * Le BFF est la seule couche qui connaît l'URL du backend ; le navigateur ne la voit jamais.
 */
export const env = {
  /** URL du backend FastAPI (sans /api/v1 : les chemins OpenAPI l'incluent). */
  backendUrl: (process.env.BACKEND_API_URL ?? "http://127.0.0.1:8080").replace(/\/+$/, ""),
  isProd: process.env.NODE_ENV === "production",
} as const;
