import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Heart,
  Mic,
  Repeat,
  TrendingUp,
  Users,
  Wand2,
} from "lucide-react";

import { Card, CardContent } from "@/shared/ui";
import { RadarChart, sampleScore, sampleScoreAfter } from "@/features/scoring";

/**
 * Tableau d'apprentissage (épic INSTRUM ★) — la métrique nord est la
 * TRANSFORMATION, pas le revenu. Données mockées ; au Sprint INT :
 * `GET /admin/learning-dashboard` (événements captés dès S2).
 */
interface Stat {
  icon: LucideIcon;
  key: string;
  value: string;
  hint?: boolean;
}

const STATS: Stat[] = [
  { icon: Users, key: "activeFounders", value: "124", hint: true },
  { icon: Wand2, key: "diagnostics", value: "312" },
  { icon: Mic, key: "pitches", value: "890" },
  { icon: Repeat, key: "retention", value: "48 %" },
  { icon: TrendingUp, key: "radarProgress", value: "+14", hint: true },
  { icon: Heart, key: "proInterest", value: "37", hint: true },
];

const RETENTION = [
  { label: "S1", value: 100 },
  { label: "S2", value: 72 },
  { label: "S3", value: 58 },
  { label: "S4", value: 48 },
];

export function LearningDashboard() {
  const t = useTranslations("Admin.overview");
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.key}>
              <CardContent className="space-y-1 pt-6">
                <span className="flex size-9 items-center justify-center rounded-full bg-coral/15 text-coral-strong">
                  <Icon className="size-5" />
                </span>
                <p className="tabular font-display text-2xl font-extrabold">
                  {s.value}
                </p>
                <p className="text-sm font-medium">{t(`stats.${s.key}`)}</p>
                {s.hint ? (
                  <p className="text-xs text-muted-foreground">{t(`stats.${s.key}Hint`)}</p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-display text-base font-bold">
              {t("transformationTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("transformationText")}
            </p>
            <div className="flex justify-center pt-2">
              <RadarChart
                score={sampleScoreAfter}
                compare={sampleScore}
                size={300}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <h3 className="font-display text-base font-bold">
              {t("retentionTitle")}
            </h3>
            <div className="flex items-end gap-4">
              {RETENTION.map((w) => (
                <div
                  key={w.label}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <span className="tabular text-xs text-muted-foreground">
                    {w.value}%
                  </span>
                  <div className="flex h-40 w-full items-end">
                    <div
                      className="w-full rounded-t-md bg-coral-strong/80"
                      style={{ height: `${w.value}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {w.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
