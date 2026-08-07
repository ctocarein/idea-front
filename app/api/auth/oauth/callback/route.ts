import { NextResponse, type NextRequest } from "next/server";

import { OAUTH_NEXT_COOKIE, safeNext } from "@/shared/auth/oauth";
import { ApiError, apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";
import { homePathFor } from "@/shared/auth/rbac";
import { persistSession } from "@/shared/auth/persist";

type TokenPair = components["schemas"]["TokenPair"];

/**
 * Retour du parcours OAuth — `GET /api/auth/oauth/callback?code=…`.
 *
 * Le back a déjà parlé au fournisseur, créé ou relié le compte, et nous tend un code à usage
 * unique. On l'échange **côté serveur** contre un TokenPair, puis on pose les cookies HttpOnly
 * comme pour une connexion classique. Le navigateur ne voit jamais de jeton.
 *
 * En cas d'échec on repart vers `/login?error=…` : ces codes sont traduits à l'affichage,
 * on ne renvoie jamais le détail backend au porteur.
 */
function failure(req: NextRequest, reason: string) {
  const url = new URL("/login", req.nextUrl.origin);
  url.searchParams.set("error", reason);
  const res = NextResponse.redirect(url);
  res.cookies.delete(OAUTH_NEXT_COOKIE);
  return res;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  // Le porteur a refusé le consentement, ou le fournisseur a renvoyé une erreur.
  if (params.get("error")) return failure(req, "oauth_denied");

  const code = params.get("code");
  if (!code) return failure(req, "oauth_missing_code");

  let role;
  try {
    const tokens = await apiFetch<TokenPair>("/api/v1/auth/oauth/exchange", {
      method: "POST",
      json: { code },
    });
    role = await persistSession(tokens);
  } catch (error) {
    // 409 : l'email est pris par un compte qu'on n'a pas pu relier automatiquement.
    if (error instanceof ApiError && error.status === 409) return failure(req, "oauth_conflict");
    return failure(req, "oauth_failed");
  }

  // Destination : là où le porteur voulait aller, sinon l'accueil de son rôle. Le chemin est
  // volontairement non localisé — le proxy le repréfixe (`/dashboard` → `/fr/dashboard`).
  const next = safeNext(req.cookies.get(OAUTH_NEXT_COOKIE)?.value) ?? homePathFor(role);
  const res = NextResponse.redirect(new URL(next, req.nextUrl.origin));
  res.cookies.delete(OAUTH_NEXT_COOKIE);
  return res;
}
