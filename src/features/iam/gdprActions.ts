"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_COOKIE, REFRESH_COOKIE, apiFetch } from "@/shared/api/client";
import { SESSION_COOKIE } from "@/shared/auth/session";
import { routes } from "@/shared/config/routes";

/**
 * RGPD — droit à l'oubli. Supprime le compte du porteur courant (`DELETE /api/v1/me`,
 * cascade DB + objets MinIO best-effort côté backend), purge les cookies de session,
 * puis redirige vers le login. En cas d'échec, renvoie un message (pas de redirect
 * dans le try/catch : `redirect()` lève une exception de contrôle de flux).
 */
export async function deleteMyAccount(): Promise<{ ok: false; message: string }> {
  try {
    await apiFetch("/api/v1/me", { method: "DELETE" });
  } catch {
    return { ok: false, message: "Suppression impossible. Réessaie dans un instant." };
  }

  const store = await cookies();
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, SESSION_COOKIE]) store.delete(name);
  redirect(`${routes.login}?deleted=1`);
}
