import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { ApiError } from "@/shared/api/client";
import { Card, CardContent } from "@/shared/ui";
import { getAcademyProgress } from "../api";

/** Carte compacte de progression Academy (pour le hub dashboard). Données réelles. */
export async function AcademyProgress() {
  let completed = 0;
  let total = 0;
  try {
    const progress = await getAcademyProgress();
    completed = progress.completed_count;
    total = progress.total_lessons;
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-coral/15 text-coral-strong">
            <GraduationCap className="size-5" />
          </span>
          <h3 className="font-display text-base font-bold">Academy</h3>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="tabular font-display text-2xl font-extrabold">{completed}</span>
          <span className="text-sm text-muted-foreground">/ {total} leçons</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-coral-strong"
            style={{ width: `${percent}%` }}
          />
        </div>
        <Link
          href={routes.academy}
          className="inline-block text-sm font-medium text-coral-strong hover:underline"
        >
          Continuer à apprendre →
        </Link>
      </CardContent>
    </Card>
  );
}
