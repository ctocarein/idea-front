"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDashed,
  Loader2,
  Mic,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button, Checkbox, Field, Input, Textarea, toast } from "@/shared/ui";
import { routes } from "@/shared/config/routes";
import { extractIdea, startManualDiagnostic, type IdeaExtract } from "../api/actions";
import { savePendingDiagnostic } from "../lib/pending";
import { useDictation } from "../lib/use-dictation";

type Step = "tell" | "organize" | "fill";

/** Monnaie de référence — transmise au back pour que les suggestions chiffrées l'utilisent. */
const CURRENCIES = [
  { code: "XOF", label: "FCFA (XOF)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "USD", label: "Dollar ($)" },
  { code: "GHS", label: "Cedi (GH₵)" },
  { code: "NGN", label: "Naira (₦)" },
  { code: "MAD", label: "Dirham (DH)" },
  { code: "CAD", label: "Dollar CA ($CA)" },
];

function appendSpeech(prev: string, chunk: string): string {
  return prev.trim() ? `${prev.trimEnd()} ${chunk}` : chunk;
}

/** Bouton micro (dictée). Rendu uniquement quand la Web Speech API est supportée. */
function MicButton({
  listening,
  onToggle,
  startLabel,
  listeningLabel,
}: {
  listening: boolean;
  onToggle: () => void;
  startLabel: string;
  listeningLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={listening}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        listening
          ? "border-coral-strong/40 bg-coral/10 text-coral-strong"
          : "text-muted-foreground hover:text-foreground hover:border-border-strong"
      }`}
    >
      <Mic className={`size-3.5 ${listening ? "animate-pulse" : ""}`} />
      {listening ? listeningLabel : startLabel}
    </button>
  );
}

/**
 * « Raconte, on structure » — l'inverse du formulaire. Le porteur raconte son idée ; le LLM
 * l'organise (12 dimensions captées/manquantes) ; on ne demande QUE les trous. Anonyme → teaser ;
 * connecté → vrai diagnostic. On n'invente rien : ce qui manque devient une question ciblée.
 *
 * `initialExtract` + `initialDescription` : passés par UploadDiagnostic pour sauter l'étape
 * "tell" et démarrer directement en mode organize (le texte du fichier a déjà été extrait).
 */
export function RaconteDiagnostic({
  isAuthed = false,
  onAnonSubmit,
  initialExtract,
  initialDescription = "",
}: {
  isAuthed?: boolean;
  onAnonSubmit?: (projectName: string) => void;
  /** Pré-extraction depuis un fichier uploadé — démarre en mode organize. */
  initialExtract?: IdeaExtract;
  /** Texte extrait du fichier (utilisé comme `description` dans le payload de scoring). */
  initialDescription?: string;
}) {
  const router = useRouter();
  const t = useTranslations("Diagnostic.raconte");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>(initialExtract ? "organize" : "tell");
  const [idea, setIdea] = useState(initialDescription);
  const [name, setName] = useState(initialExtract?.project_name ?? "");
  const [consent, setConsent] = useState(!!initialExtract); // déjà consenti via upload
  const [extract, setExtract] = useState<IdeaExtract | null>(initialExtract ?? null);
  const [gapIdx, setGapIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [currency, setCurrency] = useState(locale === "en" ? "USD" : "XOF");

  // Dictée vocale : la voix alimente le champ actif (récit en "tell", réponse en "fill").
  const { supported: micSupported, listening, toggle: toggleMic } = useDictation(
    locale,
    (chunk) => {
      if (step === "fill") setDraft((prev) => appendSpeech(prev, chunk));
      else setIdea((prev) => appendSpeech(prev, chunk));
    },
  );

  /** Brouillon initial d'un trou : la réponse déjà saisie, sinon la suggestion IA (pré-remplie). */
  function initialDraftFor(idx: number): string {
    if (!extract) return "";
    const gap = extract.gaps[idx];
    return answers[gap.key] ?? gap.suggestion ?? "";
  }

  function organize() {
    if (idea.trim().length < 20) {
      toast.error(t("errTooShort"));
      return;
    }
    if (!consent) {
      toast.error(t("errConsent"));
      return;
    }
    startTransition(async () => {
      const res = await extractIdea(idea.trim(), name.trim() || undefined, locale, currency);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      setExtract(res.data);
      setStep("organize");
    });
  }

  function submit(finalAnswers: Record<string, string>) {
    const projectName = (name.trim() || extract?.project_name || "Mon projet").slice(0, 120);
    const payload = {
      projectName,
      sector: "autre",
      description: idea.trim(),
      consent: true,
      answers: finalAnswers,
    };
    // Anonyme : on ne révèle pas le bilan → stash + teaser. Connecté : vrai diagnostic LLM.
    if (!isAuthed) {
      savePendingDiagnostic(payload);
      onAnonSubmit?.(projectName);
      return;
    }
    startTransition(async () => {
      const res = await startManualDiagnostic(payload);
      if (res.ok) {
        router.push(routes.bilan(res.reportId));
      } else if (!res.ok && res.unauthorized) {
        // Token expiré sur page publique : on traite comme anonyme (stash + teaser)
        savePendingDiagnostic(payload);
        onAnonSubmit?.(projectName);
      } else {
        toast.error(res.message);
      }
    });
  }

  function startFill() {
    if (!extract || extract.gaps.length === 0) return submit(answers);
    setGapIdx(0);
    setDraft(initialDraftFor(0));
    setStep("fill");
  }

  /** Sauvegarde la réponse courante et renvoie l'état à jour (navigation ↔). */
  function persistDraft(): Record<string, string> {
    if (!extract) return answers;
    const gap = extract.gaps[gapIdx];
    const next = { ...answers, [gap.key]: draft.trim() };
    setAnswers(next);
    return next;
  }

  function nextGap() {
    if (!extract) return;
    const updated = persistDraft();
    if (gapIdx + 1 < extract.gaps.length) {
      const nextIdx = gapIdx + 1;
      const gap = extract.gaps[nextIdx];
      setGapIdx(nextIdx);
      setDraft(updated[gap.key] ?? gap.suggestion ?? "");
    } else {
      submit(updated);
    }
  }

  function prevGap() {
    if (!extract) return;
    const updated = persistDraft();
    if (gapIdx > 0) {
      const prevIdx = gapIdx - 1;
      const gap = extract.gaps[prevIdx];
      setGapIdx(prevIdx);
      setDraft(updated[gap.key] ?? gap.suggestion ?? "");
    } else {
      setStep("organize");
    }
  }

  const mic = (
    <MicButton
      listening={listening}
      onToggle={toggleMic}
      startLabel={t("voiceStart")}
      listeningLabel={t("voiceListening")}
    />
  );

  function chips(data: IdeaExtract) {
    const done = new Set(Object.keys(answers));
    return (
      <div className="flex flex-wrap gap-2">
        {data.dimensions.map((d) => {
          const captured = d.captured || done.has(d.key);
          return (
            <span
              key={d.key}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                captured
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-warning/40 bg-warning/10 text-warning"
              }`}
            >
              {captured ? <Check className="size-3.5" /> : <CircleDashed className="size-3.5" />}
              {d.label}
            </span>
          );
        })}
      </div>
    );
  }

  // --- TELL ---
  if (step === "tell") {
    return (
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">{t("tellIntro")}</p>
        <Field label={t("nameLabel")}>
          <Input
            placeholder={t("namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
          />
        </Field>
        <Field label={t("ideaLabel")} description={t("ideaDescription")}>
          <Textarea
            rows={6}
            placeholder={t("ideaPlaceholder")}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />
        </Field>
        {micSupported && <div className="-mt-2 flex justify-end">{mic}</div>}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <label htmlFor="cur">{t("currencyLabel")}</label>
          <select
            id="cur"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-lg border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <Checkbox
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          label={t("consent")}
        />
        <Button onClick={organize} loading={pending} className="w-full">
          <Wand2 className="size-5" />
          {t("organizeCta")}
        </Button>
      </div>
    );
  }

  // --- ORGANIZE ---
  if (step === "organize" && extract) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 text-coral-strong" />
          {t.rich("captured", {
            captured: extract.captured_count,
            total: extract.total,
            gaps: extract.gaps.length,
            b: (chunks) => <span className="font-medium text-ink">{chunks}</span>,
          })}
        </div>
        {chips(extract)}
        <Button onClick={startFill} loading={pending} className="w-full">
          {extract.gaps.length > 0
            ? t("completeCta", { gaps: extract.gaps.length })
            : t("seeReportCta")}
          <ArrowRight className="size-5" />
        </Button>
      </div>
    );
  }

  // --- FILL ---
  if (step === "fill" && extract) {
    const gap = extract.gaps[gapIdx];
    // Pré-rempli d'après le récit : on le signale quand le brouillon = la suggestion IA.
    const prefilled = !!gap.suggestion && draft.trim() === gap.suggestion.trim();
    return (
      <div className="space-y-4">
        {chips(extract)}

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
              {gap.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {gapIdx + 1} / {extract.gaps.length}
            </span>
          </div>
          <p className="mb-3 font-display text-lg font-bold">{gap.question}</p>

          <Textarea
            rows={3}
            placeholder={t("gapPlaceholder")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            {prefilled ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-coral-strong" />
                {t("suggestionHint")}
              </span>
            ) : (
              <span />
            )}
            {micSupported && mic}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={prevGap} disabled={pending}>
              <ArrowLeft className="size-4" />
              {t("back")}
            </Button>
            <Button onClick={nextGap} loading={pending} disabled={!draft.trim()}>
              {gapIdx + 1 < extract.gaps.length ? t("validate") : t("finish")}
              <Check className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
      {t("preparing")}
    </div>
  );
}
