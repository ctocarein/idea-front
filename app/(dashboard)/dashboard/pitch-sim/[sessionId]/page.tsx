import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { ApiError } from "@/shared/api/client";
import { Button } from "@/shared/ui";
import { getCommittees, getPostMortem, getSession } from "@/features/pitch-simulator/api";
import { PitchPostMortem } from "@/features/pitch-simulator/components/PitchPostMortem";
import { PitchRoom } from "@/features/pitch-simulator/components/PitchRoom";

export const metadata: Metadata = { title: "La salle" };

export default async function PitchSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { sessionId } = await params;
  const { view } = await searchParams;

  let session;
  try {
    session = await getSession(sessionId);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const committees = await getCommittees().catch(() => []);
  const committee = committees.find((c) => c.key === session.committee_key) ?? null;
  const showReport = session.phase === "completed" || view === "report";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {committee?.label ?? "La salle"}
          </h1>
          <p className="text-muted-foreground">
            {showReport ? "Post-mortem" : "Comité silencieux — un juge à la fois."}
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={routes.pitchSim}>
            <ArrowLeft className="size-4" />
            Quitter
          </Link>
        </Button>
      </div>

      {showReport ? (
        <PitchPostMortem
          report={await getPostMortem(sessionId).catch(() => null)}
          sessionId={sessionId}
        />
      ) : (
        <PitchRoom session={session} committee={committee} />
      )}
    </div>
  );
}
