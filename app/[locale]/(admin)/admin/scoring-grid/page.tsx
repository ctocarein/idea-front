import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ApiError } from "@/shared/api/client";
import { Badge, Card, CardContent, EmptyState } from "@/shared/ui";
import { GridVersions } from "@/features/scoring";
import {
  getActiveGrid,
  getGridVersions,
  type Grid,
  type GridSummary,
} from "@/features/scoring/api";

export const metadata: Metadata = { title: "Grille Radar" };

/**
 * Gouvernance de la grille Radar. La grille affichée est celle que le **backend**
 * applique (`GET /scoring/grid`), pas le miroir statique du front : c'est le seul
 * endroit où l'écart entre les deux, s'il apparaissait, doit se voir.
 */
export default async function ScoringGridPage() {
  const t = await getTranslations("Admin.grid");
  const tRadar = await getTranslations("Radar");

  let grid: Grid | null = null;
  let versions: GridSummary[] = [];
  try {
    [grid, versions] = await Promise.all([getActiveGrid(), getGridVersions()]);
  } catch (error) {
    // 403 (rôle sans USER_MANAGE) ou backend KO → état vide, pas de crash.
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        {grid && <Badge variant="primary">{t("currentVersion", { version: grid.version })}</Badge>}
      </div>

      {grid ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {grid.pillars.map((pillar) => (
            <Card key={pillar.key}>
              <CardContent className="space-y-3 pt-6">
                <div>
                  <h2 className="font-display text-base font-bold">
                    {tRadar.has(`pillars.${pillar.key}.label`)
                      ? tRadar(`pillars.${pillar.key}.label`)
                      : pillar.label}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {tRadar.has(`pillars.${pillar.key}.question`)
                      ? tRadar(`pillars.${pillar.key}.question`)
                      : pillar.question}
                  </p>
                </div>
                <ul className="space-y-1.5">
                  {grid.axes
                    .filter((axis) => axis.pillar === pillar.key)
                    .map((axis) => (
                      <li
                        key={axis.key}
                        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        <span className="tabular text-xs font-semibold text-muted-foreground">
                          {axis.code}
                        </span>
                        {tRadar.has(`${axis.key}.label`) ? tRadar(`${axis.key}.label`) : axis.label}
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title={t("unavailableTitle")} description={t("unavailableBody")} />
      )}

      <GridVersions versions={versions} />
    </div>
  );
}
