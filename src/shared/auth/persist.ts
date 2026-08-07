import { cookies } from "next/headers";

import { ACCESS_COOKIE, REFRESH_COOKIE, apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";
import { env } from "@/shared/config/env";
import type { Role } from "@/shared/config/site";
import { SESSION_COOKIE, encodeSession } from "./session";

/**
 * Pose de session — le geste partagé entre les server actions (login/register) et les
 * Route Handlers du BFF (retour OAuth). Un seul endroit sait comment un TokenPair devient
 * des cookies : les jetons restent HttpOnly, le navigateur ne les voit jamais.
 *
 * `cookies()` est inscriptible dans les deux contextes — d'où la mutualisation.
 */

type TokenPair = components["schemas"]["TokenPair"];
type MeOut = components["schemas"]["MeOut"];

export const ACCESS_MAX_AGE = 60 * 15;
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function cookieBase() {
  return { httpOnly: true, secure: env.isProd, sameSite: "lax" as const, path: "/" };
}

/**
 * Écrit les trois cookies (access, refresh, miroir UX) et renvoie le rôle — qui détermine
 * la page d'accueil du porteur.
 */
export async function persistSession(tokens: TokenPair): Promise<Role> {
  const me = await apiFetch<MeOut>("/api/v1/auth/me", { token: tokens.access_token });
  const store = await cookies();
  const base = cookieBase();
  store.set(ACCESS_COOKIE, tokens.access_token, { ...base, maxAge: ACCESS_MAX_AGE });
  store.set(REFRESH_COOKIE, tokens.refresh_token, { ...base, maxAge: SESSION_MAX_AGE });
  store.set(
    SESSION_COOKIE,
    encodeSession({
      role: me.user.role as Role,
      name: me.user.full_name,
      email: me.user.email,
      onboarding_completed: me.user.onboarding_completed ?? false,
    }),
    { ...base, maxAge: SESSION_MAX_AGE },
  );
  return me.user.role as Role;
}
