import { cookies } from "next/headers";

import { ACCESS_COOKIE } from "@/shared/auth/session";
import { env } from "@/shared/config/env";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ pitchId: string }> },
) {
  const { pitchId } = await params;
  const format = new URL(req.url).searchParams.get("format") === "pptx" ? "pptx" : "pdf";
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;

  const upstream = await fetch(
    `${env.backendUrl}/api/v1/pitch/${pitchId}/export?format=${format}`,
    {
      headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
      cache: "no-store",
    },
  );

  if (!upstream.ok) {
    return new Response(null, { status: upstream.status });
  }

  const data = await upstream.arrayBuffer();
  return new Response(data, {
    headers: {
      "Content-Type":
        upstream.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Disposition":
        upstream.headers.get("Content-Disposition") ??
        `attachment; filename="pitch-${pitchId.slice(0, 8)}.${format}"`,
    },
  });
}
