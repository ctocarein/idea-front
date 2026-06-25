import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  SESSION_COOKIE,
  decodeSession,
} from "@/shared/auth/session";
import { SPACE_ROLES } from "@/shared/auth/rbac";
import { env } from "@/shared/config/env";

/**
 * Proxy (ex-middleware, renommé en Next 16) — première porte UX par rôle, AVANT le rendu.
 * Miroir du RBAC backend, mais le backend reste la vraie barrière (ARCHITECTURE_FRONTEND §5.1).
 *
 * Assure aussi le **refresh silencieux** : le miroir de session (`idx_session`, 30 j) survit à
 * l'access JWT (`idx_access`, 15 min). Quand l'access a expiré mais que le refresh est là, on
 * rejoue `/auth/refresh` et on repose les cookies — sur la réponse (navigateur) ET sur la requête
 * forwardée (pour que le rendu courant voie déjà le nouveau jeton).
 */
const GUARDS = Object.entries(SPACE_ROLES); // [["/admin", [...]], ...]

const cookieBase = { httpOnly: true, sameSite: "lax" as const, secure: env.isProd, path: "/" };

async function refreshTokens(
  refreshToken: string,
): Promise<{ access_token: string; refresh_token: string } | null> {
  try {
    const res = await fetch(`${env.backendUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as { access_token: string; refresh_token: string };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const guard = GUARDS.find(([prefix]) => pathname.startsWith(prefix));
  if (!guard) return NextResponse.next();

  const [, roles] = guard;
  const session = decodeSession(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!roles.includes(session.role)) {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  // Refresh silencieux : session valide mais access expiré (cookie disparu) + refresh dispo.
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!req.cookies.has(ACCESS_COOKIE) && refreshToken) {
    const tokens = await refreshTokens(refreshToken);
    if (!tokens) {
      // refresh invalide/révoqué → on purge et on renvoie au login
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      const res = NextResponse.redirect(url);
      res.cookies.delete(ACCESS_COOKIE);
      res.cookies.delete(REFRESH_COOKIE);
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }
    // le rendu courant doit voir le nouvel access → on mute la requête forwardée…
    req.cookies.set(ACCESS_COOKIE, tokens.access_token);
    const res = NextResponse.next({ request: { headers: req.headers } });
    // …et on pose les cookies (rotation) côté navigateur pour les requêtes suivantes.
    res.cookies.set(ACCESS_COOKIE, tokens.access_token, { ...cookieBase, maxAge: 60 * 15 });
    res.cookies.set(REFRESH_COOKIE, tokens.refresh_token, {
      ...cookieBase,
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/mentor/:path*", "/dashboard/:path*"],
};
