import { cookies } from "next/headers";

import { ACCESS_COOKIE } from "@/shared/auth/session";
import { env } from "@/shared/config/env";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pitchId: string }> },
) {
  const { pitchId } = await params;
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;

  const upstream = await fetch(`${env.backendUrl}/api/v1/pitch/${pitchId}/deck/html`, {
    headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new Response("<!doctype html><p style='font-family:sans-serif;padding:2rem'>Deck indisponible.</p>", {
      status: upstream.status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const html = await upstream.text();
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
