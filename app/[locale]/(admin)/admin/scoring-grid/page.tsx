import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { Badge, Card, CardContent } from "@/shared/ui";
import { AXES, PILLARS } from "@/features/scoring";
import { PublishGridButton } from "./_actions";

export const metadata: Metadata = { title: "Grille Radar" };

export default function ScoringGridPage() {
  const t = useTranslations("Admin.grid");
  const tRadar = useTranslations("Radar");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="primary">{t("currentVersion")}</Badge>
          <PublishGridButton />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PILLARS.map((pillar) => (
          <Card key={pillar.key}>
            <CardContent className="space-y-3 pt-6">
              <div>
                <h2 className="font-display text-base font-bold">{tRadar(`pillars.${pillar.key}.label`)}</h2>
                <p className="text-xs text-muted-foreground">{tRadar(`pillars.${pillar.key}.question`)}</p>
              </div>
              <ul className="space-y-1.5">
                {AXES.filter((a) => a.pillar === pillar.key).map((a) => (
                  <li
                    key={a.key}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="tabular text-xs font-semibold text-muted-foreground">
                      {a.code}
                    </span>
                    {tRadar(`${a.key}.label`)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
