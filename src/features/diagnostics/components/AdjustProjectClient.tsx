"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { Button, toast } from "@/shared/ui";
import { startManualDiagnostic, type IdeaExtract, type ManualDiagnosticPayload } from "../api/actions";
import { clearPendingDiagnostic, loadPendingDiagnostic } from "../lib/pending";
import { DimensionWizard, type WizardResult } from "./DimensionWizard";

type State =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; payload: ManualDiagnosticPayload; extract: IdeaExtract };

/**
 * Écran 03 du flow porteur, côté espace privé : le porteur relit les 12 dimensions que l'IA a
 * rédigées à partir de son récit anonyme, puis lance son bilan.
 *
 * Le récit vit en localStorage jusqu'ici (cf. `pending.ts`) : le rendu est donc client-only et
 * commence par un état de chargement — on ne sait qu'après montage s'il y a quelque chose à relire.
 */
export function AdjustProjectClient() {
  const router = useRouter();
  const t = useTranslations("Diagnostic.adjust");
  const [state, setState] = useState<State>({ status: "loading" });
  const [submitting, startTransition] = useTransition();

  useEffect(() => {
    const pending = loadPendingDiagnostic();

    // Récit stashé mais sans dimensions (stash d'avant le wizard, ou upload anonyme) : rien à
    // relire → on le rejoue tel quel plutôt que de laisser le porteur devant une porte close.
    if (pending && !pending.extract?.dimensions.length) {
      void (async () => {
        const res = await startManualDiagnostic(pending.payload);
        clearPendingDiagnostic();
        if (res.ok) router.replace(routes.bilan(res.reportId));
        else setState({ status: "empty" });
      })();
      return;
    }

    const next: State = pending?.extract
      ? { status: "ready", payload: pending.payload, extract: pending.extract }
      : { status: "empty" };
    // Lecture one-shot du localStorage au montage : synchro depuis un système externe, pas une
    // cascade d'état (le récit n'existe que côté navigateur jusqu'ici).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(next);
  }, [router]);

  function submit(result: WizardResult) {
    if (state.status !== "ready") return;
    const payload = { ...state.payload, answers: result.answers };
    startTransition(async () => {
      const res = await startManualDiagnostic(payload);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      clearPendingDiagnostic();
      router.push(routes.bilan(res.reportId));
    });
  }

  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        {t("loading")}
      </div>
    );
  }

  if (state.status === "empty") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <h2 className="font-display text-lg font-bold">{t("emptyTitle")}</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{t("emptyText")}</p>
        <Button asChild className="mt-5" variant="outline">
          <Link href={routes.diagnostic}>{t("emptyCta")}</Link>
        </Button>
      </div>
    );
  }

  return <DimensionWizard extract={state.extract} onComplete={submit} submitting={submitting} />;
}
