import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  SESSION_COOKIE,
  decodeSession,
} from "@/shared/auth/session";
import { SPACE_ROLES } from "@/shared/auth/rbac";
import { env } from "@/shared/config/env";
import { routing } from "@/i18n/routing";

/**
 * Proxy (ex-middleware, renommé en Next 16). Deux rôles composés :
 *  1. i18n (next-intl) : détecte la locale, redirige `/` → `/fr`, pose le cookie de locale.
 *  2. RBAC : première porte UX par rôle sur les espaces gardés (le backend reste la vraie
 *     barrière) + refresh silencieux du token.
 * Les chemins sont désormais préfixés (`/fr/dashboard`) : on retire la locale pour le RBAC,
 * et les redirections repassent par la locale courante.
 */
const GUARDS = Object.entries(SPACE_ROLES); // [["/admin", [...]], ...]
const LOCALES = routing.locales as readonly string[];
const cookieBase = { httpOnly: true, sameSite: "lax" as const, secure: env.isProd, path: "/" };

const intlMiddleware = createMiddleware(routing);

function stripLocale(pathname: string): { locale: string; rest: string } {
  const segs = pathname.split("/");
  if (LOCALES.includes(segs[1])) {
    return { locale: segs[1], rest: "/" + segs.slice(2).join("/") };
  }
  return { locale: routing.defaultLocale, rest: pathname };
}

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
  // 1. i18n : locale (redirection éventuelle vers une URL localisée).
  const intlResponse = intlMiddleware(req);
  if (intlResponse.headers.get("location")) return intlResponse;

  // 2. RBAC sur le chemin dé-localisé.
  const { pathname } = req.nextUrl;
  const { locale, rest } = stripLocale(pathname);
  const guard = GUARDS.find(([prefix]) => rest === prefix || rest.startsWith(prefix + "/"));
  if (!guard) return intlResponse;

  const [, roles] = guard;
  const session = decodeSession(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    const url = new URL(`/${locale}/login`, req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (!roles.includes(session.role)) {
    return NextResponse.redirect(new URL(`/${locale}/403`, req.url));
  }

  // Refresh silencieux : access expiré mais refresh présent.
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!req.cookies.has(ACCESS_COOKIE) && refreshToken) {
    const tokens = await refreshTokens(refreshToken);
    if (!tokens) {
      const url = new URL(`/${locale}/login`, req.url);
      url.searchParams.set("next", pathname);
      const res = NextResponse.redirect(url);
      res.cookies.delete(ACCESS_COOKIE);
      res.cookies.delete(REFRESH_COOKIE);
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }
    // On pose les nouveaux cookies sur la réponse i18n (le rendu courant retombe sur
    // le retry 401 de apiFetch si besoin ; les requêtes suivantes ont le bon jeton).
    intlResponse.cookies.set(ACCESS_COOKIE, tokens.access_token, { ...cookieBase, maxAge: 60 * 15 });
    intlResponse.cookies.set(REFRESH_COOKIE, tokens.refresh_token, {
      ...cookieBase,
      maxAge: 60 * 60 * 24 * 30,
    });
    return intlResponse;
  }

  return intlResponse;
}

export const config = {
  // next-intl doit voir toutes les pages ; on exclut l'API (BFF), les assets et _next.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
