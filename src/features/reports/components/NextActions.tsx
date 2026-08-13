"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, FileUp, GraduationCap, Mic, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge, Button, Card, CardContent } from "@/shared/ui";
import { features } from "@/shared/config/features";
import { routes } from "@/shared/config/routes";
import type { components } from "@/shared/api/schema";

import { startNextAction } from "../actions";

type NextAction = components["schemas"]["NextAction"];

const LEVER_ICON: Record<string, LucideIcon> = {
  academy: GraduationCap,
  pitchsim: Mic,
  document: FileUp,
  mentor: Users,
};

/**
 * Où mène un levier. Le backend émet des *intents* (`lever_type` + `topic`), pas des liens :
 * c'est au front de les résoudre selon ce qui existe vraiment — un levier dont la feature est
 * différée retombe sur le Workshop plutôt que d'offrir un lien mort.
 */
function destinationFor(action: NextAction): string {
  switch (action.lever_type) {
    case "pitchsim":
      return features.pitchSimulator ? routes.pitchSim : routes.academyTopic(action.topic ?? "");
    case "mentor":
      return features.mentors ? routes.mentors : routes.academyTopic(action.topic ?? "");
    case "document":
      // Le gestionnaire de documents vit sur le tableau de bord (pas de route dédiée).
      return routes.dashboard;
    default:
      return routes.academyTopic(action.topic ?? "");
  }
}

/**
 * Prochaines actions du bilan — dérivées des dimensions faibles par le backend
 * (priorité = faiblesse × poids du secteur), donc actionnables par construction.
 */
export function NextActions({ reportId, actions }: { reportId: string; actions: NextAction[] }) {
  const t = useTranslations("Bilan.actions");
  const tRadar = useTranslations("Radar");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (actions.length === 0) return null;

  function handleStart(action: NextAction) {
    startTransition(async () => {
      // L'enregistrement du démarrage ne doit jamais retenir le porteur : on navigue quoi qu'il arrive.
      await startNextAction(reportId, action.key);
      router.push(destinationFor(action));
    });
  }

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-bold tracking-tight">{t("title")}</h2>
      <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = LEVER_ICON[action.lever_type] ?? GraduationCap;
          const dimension = tRadar.has(`${action.key}.label`)
            ? tRadar(`${action.key}.label`)
            : action.dimension;
          const cta = t.has(`lever.${action.lever_type}`)
            ? t(`lever.${action.lever_type}`, { dimension: dimension.toLowerCase() })
            : action.label;

          return (
            <Card key={action.key} className={action.primary ? "border-coral/40" : undefined}>
              <CardContent className="flex flex-wrap items-center gap-3 py-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {cta}
                    {action.primary ? <Badge variant="primary">{t("priority")}</Badge> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {action.code ? `${action.code} · ` : ""}
                    {t("score", { score: action.score })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={action.primary ? "primary" : "outline"}
                  onClick={() => handleStart(action)}
                  disabled={isPending}
                >
                  {t("start")}
                  <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
