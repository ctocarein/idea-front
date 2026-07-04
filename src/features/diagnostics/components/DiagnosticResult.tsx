import { useTranslations } from "next-intl";
import { Download, Sparkles } from "lucide-react";

import { Link } from "@/i18n/navigation";
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
  const t = useTranslations("Diagnostic.result");
  const tRadar = useTranslations("Radar");

  return (
    <div className="space-y-8">
      <div className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-dawn text-ink">
          <Sparkles className="size-6" />
        </span>
        <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
          {t("title")}
        </h2>
        <p className="mt-1 text-muted-foreground">
          {t("subtitle", { projectName, reading: tRadar(`tones.${r.tone}`) })}
        </p>
      </div>

      <ComprehensionTable score={score} />

      <div className="grid items-center gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto">
          <RadarChart score={score} size={260} />
        </div>
        <div className="space-y-3">
          <h3 className="font-display text-lg font-bold">
            {t("overviewTitle")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("overviewText")}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {isAuthed ? (
              <Button asChild>
                <Link href={routes.dashboard}>{t("seeFull")}</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={routes.register}>{t("keep")}</Link>
              </Button>
            )}
            <Button variant="outline" disabled>
              <Download className="size-5" />
              {t("downloadPdf")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {isAuthed ? t("authedNote") : t("anonNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
