import { cookies } from "next/headers";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/shared/auth/session";
import { env } from "@/shared/config/env";

export { ACCESS_COOKIE, REFRESH_COOKIE };

/**
 * Client API serveur (BFF) — typé sur l'OpenAPI du backend (cf. `schema.d.ts`).
 *
 * Toute requête vers le backend passe par ici : on attache le JWT d'accès (cookie HttpOnly,
 * jamais exposé au navigateur), on normalise les erreurs, et on ne met jamais en cache (no-store).
 * Le rafraîchissement silencieux du token se fait dans le BFF (route /api/auth/refresh), pas ici.
 */

// Noms de cookies centralisés dans shared/auth/session (réexportés ci-dessus pour les appelants).

/** Erreur API normalisée (porte le statut HTTP + le détail backend si présent). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail?: unknown,
  ) {
    super(`API ${status}`);
    this.name = "ApiError";
  }
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  /** Corps JSON (sérialisé automatiquement). */
  json?: unknown;
  /** Forcer un token (ex. juste après login, avant que le cookie soit posé). */
  token?: string | null;
}

export async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const { json, token, headers, ...rest } = options;
  const accessToken = token ?? (await cookies()).get(ACCESS_COOKIE)?.value ?? null;

  const res = await fetch(`${env.backendUrl}${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      ...(json !== undefined ? { "content-type": "application/json" } : {}),
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  if (!res.ok) {
    let detail: unknown;
    try {
      detail = await res.json();
    } catch {
      detail = undefined;
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
