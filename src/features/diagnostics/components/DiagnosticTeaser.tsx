import { useTranslations } from "next-intl";
import { Hourglass, Lock } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import { ComprehensionTable, RadarChart, sampleScore } from "@/features/scoring";
import type { IdeaExtract } from "../api/actions";

/** Nombre de dimensions montrées en clair (label seul) avant le repli « + N autres ». */
const PREVIEW_COUNT = 4;

/**
 * Fin du parcours anonyme — écran 02 du flow porteur.
 *
 * Le mur ne dit plus « inscris-toi pour voir » : il montre que **le projet est déjà rédigé**,
 * et pose la vraie tension — c'est l'IA qui l'a écrit, personne ne l'a relu. Le score existe
 * mais reste provisoire tant qu'un humain n'a rien confirmé.
 *
 * `extract` est absent sur le chemin upload anonyme (on n'y fait pas l'extraction LLM, trop
 * coûteuse) → on retombe alors sur l'aperçu flouté du dashboard.
 */
export function DiagnosticTeaser({
  projectName,
  extract = null,
}: {
  projectName: string;
  extract?: IdeaExtract | null;
}) {
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

  // --- Pas d'extraction (upload anonyme) : aperçu flouté du dashboard ---
  if (!extract || extract.dimensions.length === 0) {
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

  // --- Le projet est écrit : on montre les dimensions, on voile ce qu'on en a déduit ---
  const preview = extract.dimensions.slice(0, PREVIEW_COUNT);
  const hidden = extract.dimensions.length - preview.length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-3 text-center">
        {stamp}
        <h2 className="font-display text-2xl font-bold tracking-tight">{t("titleWritten")}</h2>
        <p className="mx-auto max-w-md text-muted-foreground">
          {t.rich("subtitleWritten", { projectName: name, total: extract.total, b: bold })}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-5 border-b border-border p-5">
          <div className="pointer-events-none select-none blur-[3px]" aria-hidden>
            <RadarChart score={sampleScore} size={116} />
          </div>
          <div className="min-w-[180px] flex-1">
            <div className="flex items-baseline gap-2">
              <span className="tabular font-display text-3xl font-extrabold text-muted-foreground/60">
                ••
              </span>
              <span className="text-muted-foreground">/100</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{t("scoreHint")}</p>
          </div>
        </div>

        <ul className="divide-y divide-border">
          {preview.map((d) => (
            <li key={d.key} className="flex items-center gap-3 px-5 py-3">
              <span className="w-32 shrink-0 truncate text-sm font-medium">{d.label}</span>
              <span
                className="pointer-events-none min-w-0 flex-1 select-none truncate text-sm text-muted-foreground blur-[3.5px]"
                aria-hidden
              >
                {d.suggestion || d.evidence || d.question}
              </span>
              <Lock className="size-3.5 shrink-0 text-muted-foreground/70" />
            </li>
          ))}
        </ul>

        {hidden > 0 && (
          <p className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
            {t("more", { count: hidden })}
          </p>
        )}
      </div>

      {cta}
    </div>
  );
}
