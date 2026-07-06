import { useTranslations } from "next-intl";
import { Lock, Sparkles } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import { ComprehensionTable, RadarChart, overallScore, sampleScore } from "@/features/scoring";

/**
 * Teaser verrouillé (porteur anonyme). Le bilan est la récompense → on NE le révèle pas
 * sans inscription. On donne l'impression de VOIR son dashboard, mais flouté derrière une
 * vitre givrée : l'envie naît de deviner le vrai, pas d'un simple cadenas.
 */
export function DiagnosticTeaser({ projectName }: { projectName: string }) {
  const t = useTranslations("Diagnostic.teaser");
  const overall = overallScore(sampleScore);
  const bold = (chunks: React.ReactNode) => <span className="font-medium text-ink">{chunks}</span>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <div>
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-dawn text-ink">
          <Sparkles className="size-6" />
        </span>
        <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="mx-auto mt-1 max-w-md text-muted-foreground">
          {t.rich("subtitle", { projectName: projectName || t("projectFallback"), b: bold })}
        </p>
      </div>

      {/* Aperçu de TON dashboard, flouté derrière une vitre givrée. */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm">
        <div className="pointer-events-none max-h-[420px] select-none overflow-hidden blur-[5px]" aria-hidden>
          <div className="grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr]">
            <div className="mx-auto">
              <RadarChart score={sampleScore} size={200} />
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="tabular font-display text-4xl font-extrabold">{overall}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
            </div>
          </div>
          <div className="px-6 pb-8">
            <ComprehensionTable score={sampleScore} />
          </div>
        </div>

        {/* Vitre givrée + CTA : on devine le dashboard, on le débloque en un clic. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-card/50 via-card/70 to-card/95 px-6 text-center backdrop-blur-[2px]">
          <span className="flex size-11 items-center justify-center rounded-full bg-card shadow-lg ring-1 ring-border">
            <Lock className="size-5 text-coral-strong" />
          </span>
          <p className="max-w-sm font-display text-lg font-bold text-ink">{t("reveal")}</p>
          <Button asChild size="md">
            <Link href={routes.register}>{t("cta")}</Link>
          </Button>
          <p className="text-xs text-muted-foreground">{t("note")}</p>
        </div>
      </div>
    </div>
  );
}
