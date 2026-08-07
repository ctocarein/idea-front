"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import { loadPendingDiagnostic } from "../lib/pending";

/**
 * Passerelle entre le récit anonyme et l'espace privé. Monté sur le dashboard : si un récit
 * organisé attend en localStorage, on invite le porteur à **le relire** — on ne lance plus
 * l'analyse dans son dos.
 *
 * C'est le pivot du flow : ce que l'IA a écrit ne vaut rien tant qu'un humain ne l'a pas
 * confirmé. Le lancement du bilan se fait au bout du wizard (`/dashboard/ajuster`).
 */
export function ClaimPendingDiagnostic() {
  const t = useTranslations("Diagnostic.claim");
  const [waiting, setWaiting] = useState<{ projectName: string; total: number } | null>(null);

  useEffect(() => {
    const pending = loadPendingDiagnostic();
    if (!pending) return;
    // Lecture one-shot du localStorage au montage : synchro depuis un système externe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWaiting({
      projectName: pending.payload.projectName,
      total: pending.extract?.dimensions.length ?? 0,
    });
  }, []);

  if (!waiting) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-coral-strong/30 bg-accent px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-coral-strong">
          <Sparkles className="size-4.5" />
        </span>
        <div>
          <p className="font-display text-base font-bold">
            {t("title", { projectName: waiting.projectName })}
          </p>
          <p className="text-sm text-muted-foreground">
            {waiting.total > 0 ? t("text", { total: waiting.total }) : t("textNoExtract")}
          </p>
        </div>
      </div>
      <Button asChild size="sm">
        <Link href={routes.ajuster}>{t("cta")}</Link>
      </Button>
    </div>
  );
}
