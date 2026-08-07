import { cookies } from "next/headers";

import { ACCESS_COOKIE } from "@/shared/auth/session";
import { env } from "@/shared/config/env";

/**
 * Export RGPD (portabilité) — proxifie `GET /api/v1/me/export` et sert le JSON
 * en téléchargement (Content-Disposition). Passe par un route handler car c'est
 * un flux binaire destiné au navigateur (le BFF `apiFetch` reste server-only).
 */
export async function GET() {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return new Response(null, { status: 401 });
  }

  const upstream = await fetch(`${env.backendUrl}/api/v1/me/export`, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new Response(null, { status: upstream.status });
  }

  const body = await upstream.text();
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="ideaxion-mes-donnees.json"`,
    },
  });
}
