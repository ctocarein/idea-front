import { cookies } from "next/headers";

import { ACCESS_COOKIE } from "@/shared/auth/session";
import { env } from "@/shared/config/env";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ficheId: string }> },
) {
  const { ficheId } = await params;
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;

  const upstream = await fetch(`${env.backendUrl}/api/v1/academy/fiches/${ficheId}/pdf`, {
    headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new Response(null, { status: upstream.status });
  }

  const pdf = await upstream.arrayBuffer();
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        upstream.headers.get("Content-Disposition") ??
        `attachment; filename="besoin-${ficheId.slice(0, 8)}.pdf"`,
    },
  });
}
