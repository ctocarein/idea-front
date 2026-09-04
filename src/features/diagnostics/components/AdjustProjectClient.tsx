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
  loadDiagnosticDraft,
  saveDiagnosticDraft,
  startManualDiagnostic,
  type IdeaExtract,
  type ManualDiagnosticPayload,
} from "../api/actions";
import { clearPendingDiagnostic, loadPendingDiagnostic, savePendingDiagnostic } from "../lib/pending";
import { filledCount, resumeIndex } from "../lib/resume";
import { type SectorKey } from "../data/sectors";
import { DimensionWizard, type WizardResult } from "./DimensionWizard";
import { SectorConfirm } from "./SectorConfirm";

/** Ce qu'un brouillon serveur rend au wizard pour reprendre là où le porteur s'est arrêté. */
interface Resume {
  answers: Record<string, string>;
  lastDimension: string | null;
}

type State =
  | { status: "loading" }
  | { status: "empty" }
  // Reprise proposée AVANT le wizard : on ne réinjecte jamais une saisie sans le dire.
  | { status: "resume"; payload: ManualDiagnosticPayload; extract: IdeaExtract; resume: Resume }
  // Le secteur se confirme AVANT la relecture : une question fermée, puis les 12 dimensions.
  | { status: "sector"; payload: ManualDiagnosticPayload; extract: IdeaExtract }
  | { status: "ready"; payload: ManualDiagnosticPayload; extract: IdeaExtract; resume?: Resume };

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

    void (async () => {
      // Le SERVEUR d'abord : une saisie reprise sur un autre appareil, ou après un cache
      // vidé, n'existe que là. Le `localStorage` ne peut pas être plus récent, puisque
      // toute saisie connectée déclenche un enregistrement — en cas de conflit, le serveur
      // gagne (SPEC_DIAGNOSTIC_EN_COURS §5.3).
      const draft = await loadDiagnosticDraft();
      const draftPayload = (draft?.payload ?? {}) as {
        payload?: ManualDiagnosticPayload;
        extract?: IdeaExtract;
        sectorConfirmed?: boolean;
      };
      if (draft && draftPayload.payload && draftPayload.extract?.dimensions.length) {
        clearPendingDiagnostic(); // le serveur fait foi : plus de seconde copie locale
        setState({
          status: "resume",
          payload: draftPayload.payload,
          extract: draftPayload.extract,
          resume: { answers: draft.answers ?? {}, lastDimension: draft.lastDimension ?? null },
        });
        return;
      }

      const pending = loadPendingDiagnostic();
      if (!pending) {
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

  /**
   * Le brouillon existe dès l'OUVERTURE du wizard, avant toute décision.
   *
   * Sans cela, un porteur qui décroche sur la première dimension ne laisse aucune ligne —
   * or c'est exactement l'abandon que la mesure doit capter, et probablement le plus
   * fréquent. Le taux de complétion se calculerait alors sur un dénominateur amputé de
   * ceux qui partent le plus vite, c'est-à-dire en se flattant.
   *
   * Idempotent : reprendre un brouillon existant le réécrit à l'identique.
   */
  useEffect(() => {
    if (state.status !== "ready") return;
    void saveDiagnosticDraft({
      answers: state.resume?.answers ?? {},
      payload: { payload: state.payload, extract: state.extract, sectorConfirmed: true },
      lastDimension:
        state.resume?.lastDimension ?? state.extract.dimensions[0]?.key ?? null,
    });
    // Une seule fois par entrée dans le wizard : les changements de dimension suivants
    // passent par `persistProgress`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  /**
   * Enregistrement serveur de la saisie en cours, à chaque changement de dimension.
   *
   * Best-effort ASSUMÉ : `saveDiagnosticDraft` ne lève jamais et on n'attend pas sa
   * réponse. Un wizard qui bloque sur une requête est inutilisable en connectivité faible,
   * et la sauvegarde se rattrape à la dimension suivante — l'état envoyé est complet, pas
   * un delta, donc aucun retard ne se cumule.
   */
  function persistProgress(progress: { answers: Record<string, string>; lastDimension: string }) {
    if (state.status !== "ready") return;
    void saveDiagnosticDraft({
      answers: progress.answers,
      // Le récit et les dimensions rédigées voyagent avec : sans eux, reprendre sur un
      // autre appareil rendrait un wizard vide.
      payload: {
        payload: state.payload,
        extract: state.extract,
        sectorConfirmed: true,
      },
      lastDimension: progress.lastDimension,
    });
  }

  /** « Reprendre » — on repart de la dimension où le porteur s'était arrêté. */
  function resumeDraft() {
    if (state.status !== "resume") return;
    setState({ status: "ready", payload: state.payload, extract: state.extract, resume: state.resume });
  }

  /**
   * « Recommencer » — repartir de la première dimension, réponses remises à zéro.
   *
   * On ÉCRASE le brouillon (réponses vides) au lieu de le supprimer. Le supprimer perdrait
   * le récit et les dimensions rédigées : le `localStorage` a déjà été vidé quand le
   * serveur a pris la main, donc un rafraîchissement juste après laisserait le porteur
   * devant un écran vide. « Recommencer » veut dire « je relis depuis le début », pas
   * « jette mon projet ».
   */
  function restartDraft() {
    if (state.status !== "resume") return;
    const first = state.extract.dimensions[0]?.key ?? null;
    void saveDiagnosticDraft({
      answers: {},
      payload: { payload: state.payload, extract: state.extract, sectorConfirmed: true },
      lastDimension: first,
    });
    setState({ status: "ready", payload: state.payload, extract: state.extract });
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
      // Le brouillon serveur est clos par `_start()` lui-même, dans la transaction de
      // soumission : rien à supprimer ici, et surtout rien qui puisse échouer après coup.
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

  if (state.status === "resume") {
    const filled = filledCount(state.resume.answers);
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-lg font-bold">{t("resumeTitle")}</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          {t("resumeText", { filled, total: state.extract.dimensions.length })}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button onClick={resumeDraft}>{t("resumeCta")}</Button>
          <Button variant="outline" onClick={restartDraft}>
            {t("restartCta")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DimensionWizard
      extract={state.extract}
      onComplete={submit}
      onProgress={persistProgress}
      initialDrafts={state.resume?.answers}
      initialIndex={resumeIndex(
        state.extract.dimensions.map((d) => d.key),
        state.resume?.lastDimension,
      )}
      submitting={submitting}
    />
  );
}
