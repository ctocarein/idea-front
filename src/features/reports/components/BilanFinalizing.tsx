"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";

import { pollReportStatus } from "../actions";

/**
 * Bandeau « finalisation » : le Radar est DÉJÀ affiché (Phase 1 du bilan), on peaufine le
 * rapport détaillé + le PDF en arrière-plan (Phase 2). On interroge le statut toutes les 3 s
 * et on rafraîchit la page dès qu'il est `ready` → les sections insights/PDF apparaissent.
 */
export function BilanFinalizing({ reportId }: { reportId: string }) {
  const router = useRouter();
  const t = useTranslations("Bilan.finalizing");

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      const status = await pollReportStatus(reportId);
      if (!active) return;
      if (status === "ready" || status === "failed") {
        router.refresh();
        return;
      }
      timer = setTimeout(tick, 3000);
    };
    timer = setTimeout(tick, 3000);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [reportId, router]);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-coral-strong/25 bg-coral/5 px-4 py-3">
      <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-dawn text-ink">
        <Sparkles className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{t("title")}</p>
        <p className="text-xs text-muted-foreground">{t("text")}</p>
      </div>
      <Loader2 className="size-4 shrink-0 animate-spin text-coral-strong" />
    </div>
  );
}
