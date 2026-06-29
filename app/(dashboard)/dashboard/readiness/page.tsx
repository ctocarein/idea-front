import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, GraduationCap, Mic, type LucideIcon } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Badge, Button, Card, CardContent } from "@/shared/ui";
import {
  AXES,
  LEVERS,
  RadarChart,
  TONE_TO_BADGE,
  maturityLevel,
  overallScore,
  type AxisKey,
} from "@/features/scoring";
import { getLatestRadar } from "@/features/reports/api";
import { ExpressInterest } from "./_interest";

export const metadata: Metadata = { title: "Readiness" };

/** Pistes génériques par dimension. */
const HINTS: Record<AxisKey, string> = {
  d1: "Clarifie pour qui le problème est le plus aigu.",
  d2: "Montre que ta solution résout vraiment ce problème.",
  d3: "Affûte ce qui te rend vraiment différent.",
  d4: "Chiffre ta demande par le bas, avec des preuves.",
  d5: "Situe-toi face aux alternatives existantes.",
  d6: "Précise qui paie et tes unit economics.",
  d7: "Apporte des preuves d'usage, même petites.",
  d8: "Décris ce qui rendra la croissance répétable.",
  d9: "Détaille comment tu vas atteindre tes premiers clients.",
  d10: "Montre pourquoi ton équipe peut exécuter.",
  d11: "Précise où en est concrètement le projet.",
  d12: "Nomme tes risques majeurs et comment tu les réduis.",
};

/** Libellé du CTA selon le type de levier. */
function leverCta(key: AxisKey): { href: string; label: string; icon: LucideIcon } {
  const lever = LEVERS[key];
  switch (lever.type) {
    case "academy":
      return { href: routes.academyTopic(lever.topic), label: "Aller à l'Academy", icon: GraduationCap };
    case "pitchsim":
      return { href: routes.pitchSim, label: "S'exercer au pitch", icon: Mic };
    case "mentor":
      return { href: routes.mentors, label: "Trouver un mentor", icon: ArrowUpRight };
    default:
      return { href: routes.academy, label: "Aller à l'Academy", icon: GraduationCap };
  }
}

export default async function ReadinessPage() {
  const score = await getLatestRadar();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Suis-je prêt ?</h1>
        <p className="text-muted-foreground">
          Une lecture honnête de ton chemin — et de ce qu&apos;il te reste.
        </p>
      </div>

      {score ? (
        <ReadinessContent score={score} />
      ) : (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-8">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">
                Lance d&apos;abord ton diagnostic
              </h2>
              <p className="text-sm text-muted-foreground">
                Ta lecture « suis-je prêt ? » se construit à partir de ton bilan.
              </p>
            </div>
            <Button asChild>
              <Link href={routes.diagnostic}>
                Commencer mon diagnostic
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReadinessContent({ score }: { score: NonNullable<Awaited<ReturnType<typeof getLatestRadar>>> }) {
  const overall = overallScore(score);
  const maturity = maturityLevel(overall);
  const weak = [...AXES]
    .sort((a, b) => (score.axes[a.key] ?? 0) - (score.axes[b.key] ?? 0))
    .slice(0, 3);

  return (
    <>
      <Card>
        <CardContent className="grid items-center gap-6 pt-6 sm:grid-cols-[auto_1fr]">
          <div className="mx-auto">
            <RadarChart score={score} size={240} />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="tabular font-display text-3xl font-extrabold">{overall}</span>
              <span className="text-muted-foreground">/100</span>
              <Badge variant={TONE_TO_BADGE[maturity.tone]}>{maturity.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{maturity.description}</p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold tracking-tight">Ce qu&apos;il me reste</h2>
        <div className="space-y-2">
          {weak.map((axis) => {
            const cta = leverCta(axis.key as AxisKey);
            const Icon = cta.icon;
            return (
              <div
                key={axis.key}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="tabular mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                  {score.axes[axis.key]}
                </span>
                <div className="flex-1 space-y-2">
                  <p className="font-medium">{axis.label}</p>
                  <p className="text-sm text-muted-foreground">{HINTS[axis.key]}</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={cta.href}>
                      <Icon className="size-4" />
                      {cta.label}
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Invitation Phase Pro — jamais une injonction (BESOINS_PORTEUR cas 4) */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="size-5 text-coral-strong" />
            <h2 className="font-display text-lg font-bold tracking-tight">
              Aller plus loin, quand tu le sens
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Un accompagnement réel par un mentor t&apos;amènerait au niveau certifiable — et te
            relierait au capital. Rien ne presse : c&apos;est ton choix, à partir de ton constat.
          </p>
          <ExpressInterest />
        </CardContent>
      </Card>
    </>
  );
}
