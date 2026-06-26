import Link from "next/link";
import { Download, Sparkles } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import {
  ComprehensionTable,
  RadarChart,
  overallScore,
  reading,
  type RadarScore,
} from "@/features/scoring";

/**
 * Bilan de diagnostic (vue porteur). Le tableau de compréhension d'abord
 * (pédagogique), le Radar brut en appui. CTA non agressif vers la création
 * d'espace. Le PDF réel viendra du backend (job `generate_bilan`).
 */
export function DiagnosticResult({
  score,
  projectName,
  isAuthed = false,
}: {
  score: RadarScore;
  projectName: string;
  isAuthed?: boolean;
}) {
  const overall = overallScore(score);
  const r = reading(overall);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-dawn text-ink">
          <Sparkles className="size-6" />
        </span>
        <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
          Voici ton tableau de compréhension
        </h2>
        <p className="mt-1 text-muted-foreground">
          {projectName} — une lecture honnête de tes forces et de tes angles
          morts. {r.label} dans l&apos;ensemble.
        </p>
      </div>

      <ComprehensionTable score={score} />

      <div className="grid items-center gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto">
          <RadarChart score={score} size={260} />
        </div>
        <div className="space-y-3">
          <h3 className="font-display text-lg font-bold">
            La vue d&apos;ensemble
          </h3>
          <p className="text-sm text-muted-foreground">
            Le Radar de Collision résume tes 12 dimensions. C&apos;est ta boussole : tu
            le verras progresser au fil de l&apos;Academy et du simulateur de
            pitch.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {isAuthed ? (
              <Button asChild>
                <Link href={routes.dashboard}>Voir mon bilan complet</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={routes.register}>Garder mon bilan</Link>
              </Button>
            )}
            <Button variant="outline" disabled>
              <Download className="size-5" />
              Télécharger le PDF
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {isAuthed
              ? "Ton bilan est rattaché à ton espace — retrouve-le et télécharge le PDF depuis ton tableau de bord."
              : "Crée ton espace (gratuit) pour conserver ce bilan, le télécharger en PDF et démarrer ton parcours."}
          </p>
        </div>
      </div>
    </div>
  );
}
