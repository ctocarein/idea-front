"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";

import { Badge, Button, Card, CardContent, toast } from "@/shared/ui";

import { activateGrid } from "../actions";
import type { GridSummary } from "../api";

/**
 * Gouvernance des versions de grille (admin). L'authoring d'une grille se fait en
 * atelier puis par seed/migration côté backend : ici on ne rédige pas, on **arbitre**
 * quelle version fait foi. Le backend audite chaque activation.
 */
export function GridVersions({ versions }: { versions: GridSummary[] }) {
  const t = useTranslations("Admin.grid");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  function handleActivate(version: string) {
    startTransition(async () => {
      const result = await activateGrid(version);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(t("activated", { version }));
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="pt-2">
        <h2 className="py-3 font-display text-base font-bold">{t("versionsTitle")}</h2>
        {versions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("versionsEmpty")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {versions.map((v) => (
              <li key={v.version} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span className="tabular-nums">{v.version}</span>
                    {v.is_active && (
                      <Badge variant="success">
                        <CheckCircle2 />
                        {t("active")}
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("scale", { max: v.scale_max })} · {dateFmt.format(new Date(v.created_at))}
                  </p>
                </div>
                {!v.is_active && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleActivate(v.version)}
                    disabled={isPending}
                  >
                    {t("activate")}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
