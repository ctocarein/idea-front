import { cookies } from "next/headers";

import { ACCESS_COOKIE } from "@/shared/auth/session";
import { env } from "@/shared/config/env";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ pitchId: string }> },
) {
  const { pitchId } = await params;
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;

  const form = await req.formData();
  const upstream = await fetch(`${env.backendUrl}/api/v1/pitch/${pitchId}/deck/import`, {
    method: "POST",
    headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
    body: form,
    cache: "no-store",
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
