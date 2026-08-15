import { NextResponse, type NextRequest } from "next/server";

import {
  OAUTH_NEXT_COOKIE,
  OAUTH_NEXT_MAX_AGE,
  isOAuthProvider,
  safeNext,
} from "@/shared/auth/oauth";
import { cookieBase } from "@/shared/auth/persist";
import { env } from "@/shared/config/env";
import { site } from "@/shared/config/site";

/**
 * Entrée du parcours OAuth — `GET /api/auth/oauth/google|linkedin`.
 *
 * Règle BFF : le navigateur ne doit jamais connaître l'URL du backend (cf. `shared/config/env`).
 * On interroge donc l'endpoint d'autorisation **côté serveur** et on ne renvoie au navigateur que
 * l'URL de consentement du fournisseur (Google/LinkedIn). Ça marche même quand `BACKEND_API_URL`
 * est une adresse interne non joignable depuis le navigateur (ex. `http://api:8000`), et si le
 * back est injoignable on dégrade proprement au lieu d'un écran « connexion refusée ».
 *
 * La destination post-connexion voyage dans un cookie court plutôt que dans l'aller-retour OAuth :
 * le back n'a pas à la porter, et elle ne peut pas être forgée en cours de route.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  // Origine canonique, JAMAIS `req.nextUrl.origin` : derrière nginx-proxy, Next.js reconstruit
  // l'origine depuis les en-têtes (`Host: localhost` + `X-Forwarded-Proto: https`) et produit
  // `https://localhost:80`. Le back rejette alors le redirect_uri (anti open-redirect).
  const backToLogin = (error: string) =>
    NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, site.url));

  if (!isOAuthProvider(provider)) return backToLogin("oauth_provider");

  const authorize = new URL(`${env.backendUrl}/api/v1/auth/oauth/${provider}/authorize`);
  // Le back a besoin de savoir où renvoyer le fournisseur : notre callback, sur l'origine
  // canonique du portail. Cette valeur doit être IDENTIQUE à l'autorisation et à l'échange,
  // sinon le fournisseur refuse (`redirect_uri_mismatch`).
  authorize.searchParams.set(
    "redirect_uri",
    new URL("/api/auth/oauth/callback", site.url).toString(),
  );

  // On suit l'autorisation côté serveur (jamais le navigateur) et on récupère l'URL du fournisseur.
  // Par précaution, on relaie aussi les cookies éventuels posés par le back à cette étape (ex. un
  // `state` OAuth) : le navigateur ne touchant plus le back ici, sans ce relais ils seraient perdus.
  // `getSetCookie()` garde chaque en-tête séparé — un `get("set-cookie")` les fusionnerait de
  // travers sur les virgules des dates d'expiration.
  let location: string | null;
  let setCookies: string[] = [];
  try {
    const upstream = await fetch(authorize, { redirect: "manual", cache: "no-store" });
    location = upstream.headers.get("location");
    setCookies =
      (upstream.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.() ?? [];
  } catch {
    // Backend injoignable (ex. pas lancé en local) → erreur propre plutôt qu'un écran cassé.
    return backToLogin("oauth_failed");
  }

  if (!location) return backToLogin("oauth_failed");

  let target: URL;
  try {
    target = new URL(location);
  } catch {
    return backToLogin("oauth_failed");
  }

  // Le back nous renvoie vers lui-même (ex. fournisseur non configuré côté back) → on ramène le
  // porteur sur NOTRE login, sans jamais exposer l'URL backend au navigateur.
  if (target.origin === new URL(env.backendUrl).origin) {
    return backToLogin(target.searchParams.get("error") ?? "oauth_failed");
  }

  const res = NextResponse.redirect(target);

  // Relais des cookies du back (un cookie host-only devient le nôtre ; un `Domain` étranger sera
  // simplement ignoré par le navigateur — inoffensif).
  for (const cookie of setCookies) res.headers.append("set-cookie", cookie);

  const next = safeNext(req.nextUrl.searchParams.get("next"));
  if (next) {
    res.cookies.set(OAUTH_NEXT_COOKIE, next, { ...cookieBase(), maxAge: OAUTH_NEXT_MAX_AGE });
  }
  return res;
}