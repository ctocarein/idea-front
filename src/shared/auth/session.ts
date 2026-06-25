import type { Role } from "@/shared/config/site";

/**
 * Session côté front (ARCHITECTURE_FRONTEND.md §7).
 *
 * Les vrais jetons (access/refresh JWT) vivent dans des cookies **HttpOnly** posés
 * par le BFF (cf. `features/auth/api/actions`) — invisibles au navigateur. Ce cookie-ci
 * est un **miroir UX** non sensible (rôle, identité) encodé en base64 : il sert à piloter
 * l'affichage et le garde-fou de rôle (proxy), jamais à autoriser côté backend.
 *
 * Ce module est PUR (aucun import next/react) → utilisable dans `proxy.ts` (edge),
 * les Server Components et le typage client.
 */
export interface Session {
  role: Role;
  name: string;
  email: string;
}

/** Cookie miroir de session UX (rôle/identité). */
export const SESSION_COOKIE = "idx_session";
/** Cookies des jetons (HttpOnly). Noms centralisés ici car utilisés aussi côté edge. */
export const ACCESS_COOKIE = "idx_access";
export const REFRESH_COOKIE = "idx_refresh";

export function encodeSession(session: Session): string {
  const json = JSON.stringify(session);
  // btoa existe côté Edge/navigateur ; Buffer côté Node. On couvre les deux.
  if (typeof btoa === "function") {
    return btoa(unescape(encodeURIComponent(json)));
  }
  return Buffer.from(json, "utf-8").toString("base64");
}

export function decodeSession(value: string | undefined): Session | null {
  if (!value) return null;
  try {
    const json =
      typeof atob === "function"
        ? decodeURIComponent(escape(atob(value)))
        : Buffer.from(value, "base64").toString("utf-8");
    const parsed = JSON.parse(json) as Partial<Session>;
    if (!parsed.role || !parsed.email) return null;
    return parsed as Session;
  } catch {
    return null;
  }
}
