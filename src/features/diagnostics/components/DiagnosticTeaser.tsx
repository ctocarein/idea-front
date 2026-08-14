import { useTranslations } from "next-intl";
import { Hourglass, Lock } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import { ComprehensionTable, RadarChart, sampleScore } from "@/features/scoring";

/**
 * Fin du parcours anonyme — le mur (écran 02 du flow porteur).
 *
 * Honnêteté : rien n'a encore été analysé. L'organisation par l'IA puis l'analyse sont
 * **post-inscription** (à l'ouverture du wizard). Le mur montre donc un aperçu flouté générique
 * et pose la vraie promesse — crée ton espace, l'IA organise ton idée, tu la relis, puis ton
 * bilan se construit. Surtout pas « ton bilan est déjà prêt ».
 */
export function DiagnosticTeaser({ projectName }: { projectName: string }) {
  const t = useTranslations("Diagnostic.teaser");
  const bold = (chunks: React.ReactNode) => <span className="font-medium text-ink">{chunks}</span>;
  const name = projectName || t("projectFallback");

  const stamp = (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-warning/60 bg-warning/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-warning">
      <Hourglass className="size-3" />
      {t("provisional")}
    </span>
  );

  const cta = (
    <div className="rounded-2xl border border-coral-strong/30 bg-accent px-5 py-4 text-left">
      <p className="text-sm">
        {t.rich("ctaPitch", { b: (chunks) => <strong className="font-semibold">{chunks}</strong> })}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button asChild size="md">
          <Link href={routes.register}>{t("cta")}</Link>
        </Button>
        <Link
          href={routes.login}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("haveAccount")}
        </Link>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t("note")}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <div className="space-y-3">
        {stamp}
        <h2 className="font-display text-2xl font-bold tracking-tight">{t("titleGeneric")}</h2>
        <p className="mx-auto max-w-md text-muted-foreground">
          {t.rich("subtitle", { projectName: name, b: bold })}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm">
        <div
          className="pointer-events-none max-h-[360px] select-none overflow-hidden blur-[5px]"
          aria-hidden
        >
          <div className="grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr]">
            <div className="mx-auto">
              <RadarChart score={sampleScore} size={200} />
            </div>
          </div>
          <div className="px-6 pb-8">
            <ComprehensionTable score={sampleScore} />
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-card/50 via-card/70 to-card/95 px-6 text-center backdrop-blur-[2px]">
          <span className="flex size-11 items-center justify-center rounded-full bg-card shadow-lg ring-1 ring-border">
            <Lock className="size-5 text-coral-strong" />
          </span>
          <p className="max-w-sm font-display text-lg font-bold text-ink">{t("reveal")}</p>
        </div>
      </div>

      {cta}
    </div>
  );
}
