import { NextResponse, type NextRequest } from "next/server";

import {
  OAUTH_NEXT_COOKIE,
  OAUTH_NEXT_MAX_AGE,
  isOAuthProvider,
  safeNext,
} from "@/shared/auth/oauth";
import { cookieBase } from "@/shared/auth/persist";
import { env } from "@/shared/config/env";

/**
 * Entrée du parcours OAuth — `GET /api/auth/oauth/google|linkedin`.
 *
 * Ce saut existe pour une seule raison : le navigateur ne doit jamais connaître l'URL du
 * backend (règle BFF, cf. `shared/config/env`). Le bouton pointe donc vers notre origine,
 * et c'est le serveur qui renvoie vers l'autorisation backend.
 *
 * La destination post-connexion voyage dans un cookie court plutôt que dans l'aller-retour
 * OAuth : le back n'a pas à la porter, et elle ne peut pas être forgée en cours de route.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  if (!isOAuthProvider(provider)) {
    return NextResponse.redirect(new URL("/login?error=oauth_provider", req.url));
  }

  const authorize = new URL(`${env.backendUrl}/api/v1/auth/oauth/${provider}/authorize`);
  // Le back a besoin de savoir où nous renvoyer : notre origine réelle (utile derrière
  // un proxy ou en préproduction, où elle diffère d'un environnement à l'autre).
  authorize.searchParams.set(
    "redirect_uri",
    new URL("/api/auth/oauth/callback", req.nextUrl.origin).toString(),
  );

  const res = NextResponse.redirect(authorize);

  const next = safeNext(req.nextUrl.searchParams.get("next"));
  if (next) {
    res.cookies.set(OAUTH_NEXT_COOKIE, next, { ...cookieBase(), maxAge: OAUTH_NEXT_MAX_AGE });
  }
  return res;
}
