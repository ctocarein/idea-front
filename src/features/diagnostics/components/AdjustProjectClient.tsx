"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Loader2 } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { Button, toast } from "@/shared/ui";
import {
  extractIdea,
  startManualDiagnostic,
  type IdeaExtract,
  type ManualDiagnosticPayload,
} from "../api/actions";
import { clearPendingDiagnostic, loadPendingDiagnostic, savePendingDiagnostic } from "../lib/pending";
import { type SectorKey } from "../data/sectors";
import { DimensionWizard, type WizardResult } from "./DimensionWizard";
import { SectorConfirm } from "./SectorConfirm";

type State =
  | { status: "loading" }
  | { status: "empty" }
  // Le secteur se confirme AVANT la relecture : une question fermée, puis les 12 dimensions.
  | { status: "sector"; payload: ManualDiagnosticPayload; extract: IdeaExtract }
  | { status: "ready"; payload: ManualDiagnosticPayload; extract: IdeaExtract };

/**
 * Écran 03 du flow porteur, côté espace privé : le porteur relit les 12 dimensions que l'IA a
 * rédigées à partir de son récit, puis lance son bilan.
 *
 * C'est ICI que l'IA organise, désormais — après l'inscription. Le récit est stashé brut en
 * anonyme (aucun appel LLM avant le compte) ; à l'ouverture du wizard on lance l'extraction si
 * elle n'a pas encore tourné, puis on la réécrit dans le stash (un refresh ne relance pas le LLM).
 *
 * Le récit vit en localStorage jusqu'ici (cf. `pending.ts`) : le rendu est donc client-only et
 * commence par un état de chargement — on ne sait qu'après montage s'il y a quelque chose à relire.
 */
export function AdjustProjectClient() {
  const router = useRouter();
  const t = useTranslations("Diagnostic.adjust");
  const locale = useLocale();
  const [state, setState] = useState<State>({ status: "loading" });
  const [submitting, startTransition] = useTransition();
  // Garde : l'organisation LLM est un one-shot, jamais rejoué (StrictMode / re-render).
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const pending = loadPendingDiagnostic();
    if (!pending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "empty" });
      return;
    }

    // Déjà des dimensions (upload connecté pré-extrait, ou refresh après organisation) : droit
    // au wizard, aucun appel LLM. Le secteur reste à trancher s'il ne l'a pas encore été.
    if (pending.extract?.dimensions.length) {
      setState({
        status: pending.sectorConfirmed ? "ready" : "sector",
        payload: pending.payload,
        extract: pending.extract,
      });
      return;
    }

    // Cas normal désormais : récit brut → l'IA organise ICI (session connectée), puis on relit.
    void (async () => {
      const desc = pending.payload.description?.trim();

      // Rien à organiser (ex. upload anonyme sans texte) : on ne bloque pas → bilan tel quel.
      if (!desc) {
        const res = await startManualDiagnostic(pending.payload);
        clearPendingDiagnostic();
        if (res.ok) router.replace(routes.bilan(res.reportId));
        else setState({ status: "empty" });
        return;
      }

      const res = await extractIdea(
        desc,
        pending.payload.projectName,
        pending.lang ?? locale,
        pending.currency,
      );

      if (!res.ok) {
        // Extraction impossible : on ne laisse pas le porteur bloqué → repli sur le bilan direct.
        const fallback = await startManualDiagnostic(pending.payload);
        clearPendingDiagnostic();
        if (fallback.ok) {
          router.replace(routes.bilan(fallback.reportId));
        } else {
          toast.error(res.message);
          setState({ status: "empty" });
        }
        return;
      }

      // On réécrit l'extract dans le stash : un refresh du wizard ne relancera pas le LLM.
      savePendingDiagnostic(pending.payload, res.data, {
        currency: pending.currency,
        lang: pending.lang ?? locale,
      });
      // L'extraction a proposé un secteur : le porteur le confirme avant de relire.
      setState({ status: "sector", payload: pending.payload, extract: res.data });
    })();
  }, [router, locale]);

  /** Le secteur tranché entre dans le payload et dans le stash (un refresh ne le redemande pas). */
  function confirmSector(sector: SectorKey) {
    if (state.status !== "sector") return;
    const payload = { ...state.payload, sector };
    const pending = loadPendingDiagnostic();
    savePendingDiagnostic(payload, state.extract, {
      currency: pending?.currency,
      lang: pending?.lang ?? locale,
      sectorConfirmed: true,
    });
    setState({ status: "ready", payload, extract: state.extract });
  }

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
          <Link href={routes.dashboard}>{t("emptyCta")}</Link>
        </Button>
      </div>
    );
  }

  if (state.status === "sector") {
    return (
      <SectorConfirm proposal={state.extract.sector_proposal} onConfirm={confirmSector} />
    );
  }

  return <DimensionWizard extract={state.extract} onComplete={submit} submitting={submitting} />;
}
