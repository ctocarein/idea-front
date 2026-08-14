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

/**
 * Enveloppe d'erreur uniforme du backend (`app/core/errors.py`) :
 * `{ error: { code, message, details } }`. Les `code` sont stables et documentés
 * (`VALIDATION_ERROR`, `BUSINESS_RULE`, `CONFLICT`, `RATE_LIMITED`, `PAYMENT_REQUIRED`…),
 * les `message` sont déjà rédigés en français à destination de l'utilisateur.
 */
export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown[] };
}

function errorBody(error: unknown): ApiErrorBody["error"] | null {
  if (!(error instanceof ApiError)) return null;
  const detail = error.detail as Partial<ApiErrorBody> | undefined;
  const body = detail?.error;
  return body && typeof body.message === "string" ? (body as ApiErrorBody["error"]) : null;
}

/** Code métier porté par l'erreur (`BUSINESS_RULE`, `CONFLICT`…), ou `null`. */
export function apiErrorCode(error: unknown): string | null {
  return errorBody(error)?.code ?? null;
}

/**
 * Message affichable : on préfère celui du backend, qui connaît la règle violée
 * (« Présentez votre pitch avant de délibérer »), au message générique du front.
 *
 * Les 5xx sont exclus à dessein : le backend y renvoie un message volontairement
 * opaque, et c'est au front de proposer sa formulation (et un « réessayer »).
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.status >= 500) return fallback;
  return errorBody(error)?.message ?? fallback;
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  /** Corps JSON (sérialisé automatiquement). */
  json?: unknown;
  /** Corps multipart (upload de fichier). On laisse fetch poser le boundary. */
  formData?: FormData;
  /** Forcer un token (ex. juste après login, avant que le cookie soit posé). */
  token?: string | null;
}

export async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const { json, formData, token, headers, ...rest } = options;
  const accessToken = token ?? (await cookies()).get(ACCESS_COOKIE)?.value ?? null;

  let res: Response;
  try {
    res = await fetch(`${env.backendUrl}${path}`, {
      ...rest,
      cache: "no-store",
      headers: {
        // Pour le multipart on NE fixe PAS content-type (fetch gère le boundary).
        ...(json !== undefined ? { "content-type": "application/json" } : {}),
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : (formData ?? undefined),
    });
  } catch (cause) {
    // Backend injoignable (réseau / reset). On normalise en ApiError(503) pour que les
    // pages dégradent proprement (empty state) au lieu de planter sur l'error boundary.
    throw new ApiError(503, cause);
  }

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
