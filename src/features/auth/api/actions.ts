"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_COOKIE, ApiError, REFRESH_COOKIE, apiFetch } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";
import { homePathFor } from "@/shared/auth/rbac";
import { SESSION_COOKIE, encodeSession } from "@/shared/auth/session";
import { env } from "@/shared/config/env";
import { routes } from "@/shared/config/routes";
import type { Role } from "@/shared/config/site";

/**
 * Auth réelle (Sprint INT) — BFF. Le navigateur ne voit JAMAIS les tokens : on les pose en
 * cookies HttpOnly. Les actions renvoient un RÉSULTAT (succès+redirection ou message d'erreur)
 * — la navigation se fait côté client, ce qui évite le piège du `redirect()` dans un try/catch.
 */

type TokenPair = components["schemas"]["TokenPair"];
type MeOut = components["schemas"]["MeOut"];

export type AuthResult = { ok: true; redirectTo: string } | { ok: false; message: string };

const DEMO_PASSWORD = "ideaxion"; // comptes de seed (local)
const DEMO_EMAIL: Record<Role, string> = {
  founder: "founder@ideaxion.dev",
  mentor: "mentor@ideaxion.dev",
  analyst: "analyst@ideaxion.dev",
  admin: "admin@ideaxion.dev",
};

function cookieBase() {
  return { httpOnly: true, secure: env.isProd, sameSite: "lax" as const, path: "/" };
}

/** Pose les cookies (tokens + miroir de session UX) à partir d'un TokenPair. */
async function persistSession(tokens: TokenPair): Promise<Role> {
  const me = await apiFetch<MeOut>("/api/v1/auth/me", { token: tokens.access_token });
  const store = await cookies();
  const base = cookieBase();
  store.set(ACCESS_COOKIE, tokens.access_token, { ...base, maxAge: 60 * 15 });
  store.set(REFRESH_COOKIE, tokens.refresh_token, { ...base, maxAge: 60 * 60 * 24 * 30 });
  store.set(
    SESSION_COOKIE,
    encodeSession({
      role: me.user.role as Role,
      name: me.user.full_name,
      email: me.user.email,
    }),
    { ...base, maxAge: 60 * 60 * 24 * 30 },
  );
  return me.user.role as Role;
}

function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Email ou mot de passe incorrect.";
    if (error.status === 409) return "Un compte existe déjà avec cet email.";
    if (error.status === 429) return "Trop de tentatives. Réessaie dans un instant.";
  }
  return "Connexion impossible. Réessaie.";
}

export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const tokens = await apiFetch<TokenPair>("/api/v1/auth/login", {
      method: "POST",
      json: { email, password },
    });
    const role = await persistSession(tokens);
    return { ok: true, redirectTo: homePathFor(role) };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

export async function registerFounder(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const tokens = await apiFetch<TokenPair>("/api/v1/auth/register", {
      method: "POST",
      json: { name, email, password, consent: true },
    });
    await persistSession(tokens);
    return { ok: true, redirectTo: routes.onboarding };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

/** Connexion rapide à un rôle de démo (comptes de seed). */
export async function signInAs(role: Role): Promise<AuthResult> {
  return login(DEMO_EMAIL[role], DEMO_PASSWORD);
}

/** Déconnexion : révoque le refresh côté backend (best-effort) + purge les cookies. */
export async function signOut(): Promise<void> {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    try {
      await apiFetch("/api/v1/auth/logout", {
        method: "POST",
        json: { refresh_token: refresh },
      });
    } catch {
      // best-effort
    }
  }
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, SESSION_COOKIE]) store.delete(name);
  redirect(routes.login);
}
