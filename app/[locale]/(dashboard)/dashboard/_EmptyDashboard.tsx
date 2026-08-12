import { ArrowRight, Compass, GraduationCap, Palette, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Badge, Card, CardContent } from "@/shared/ui";
import { RadarChart, sampleScore } from "@/features/scoring";
import { ClaimPendingDiagnostic, NewDiagnosticModal } from "@/features/diagnostics";

/**
 * Espace porteur sans diagnostic (état réel d'un compte frais). On ne montre pas de fausses
 * données : un accueil chaleureux et une seule action claire — lancer le diagnostic.
 */
export async function EmptyDashboard({ firstName }: { firstName: string }) {
  const t = await getTranslations("Dashboard");
  const steps = [
    { icon: Compass, key: "understand", active: true },
    { icon: GraduationCap, key: "structure", active: false },
    { icon: Palette, key: "dress", active: false },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Filet : rattache un récit stashé (relecture interrompue) et ramène le porteur au wizard. */}
      <ClaimPendingDiagnostic />
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t("greeting", { name: firstName })}
        </h1>
        <p className="text-muted-foreground">{t("empty.subtitle")}</p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="grid items-center gap-8 pt-6 sm:grid-cols-[auto_1fr]">
          {/* Aperçu de la boussole — estompé tant qu'il n'y a pas de diagnostic. */}
          <div className="relative mx-auto" aria-hidden>
            <div className="opacity-25 blur-[1px]">
              <RadarChart score={sampleScore} size={220} />
            </div>
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-xs font-medium text-muted-foreground">
              {t("empty.compassPlaceholder")}
            </span>
          </div>

          <div className="space-y-4">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-dawn text-ink">
              <Sparkles className="size-6" />
            </span>
            <div className="space-y-1">
              <h2 className="font-display text-xl font-bold tracking-tight">{t("empty.ctaTitle")}</h2>
              <p className="max-w-md text-muted-foreground">{t("empty.ctaText")}</p>
            </div>
            <NewDiagnosticModal size="md">
              {t("empty.ctaButton")}
              <ArrowRight className="size-5" />
            </NewDiagnosticModal>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold tracking-tight">{t("empty.journeyTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ icon: Icon, key, active }) => (
            <Card key={key} className={active ? "" : "opacity-70"}>
              <CardContent className="space-y-2 pt-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                    <Icon className="size-5" />
                  </span>
                  <Badge variant={active ? "primary" : "outline"}>
                    {active ? t("empty.toStart") : t("empty.upcoming")}
                  </Badge>
                </div>
                <h3 className="font-display text-base font-bold">{t(`empty.steps.${key}.label`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`empty.steps.${key}.text`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
