import { cookies } from "next/headers";

import { ACCESS_COOKIE } from "@/shared/auth/session";
import { env } from "@/shared/config/env";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await params;
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;

  const upstream = await fetch(`${env.backendUrl}/api/v1/reports/${reportId}/html`, {
    headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new Response(null, { status: upstream.status });
  }

  const html = await upstream.text();
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition":
        upstream.headers.get("Content-Disposition") ??
        `attachment; filename="bilan-${reportId.slice(0, 8)}.html"`,
    },
  });
}
