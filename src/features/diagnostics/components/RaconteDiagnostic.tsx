"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, CircleDashed, Loader2, Sparkles, Wand2 } from "lucide-react";

import { Button, Checkbox, Field, Input, Textarea, toast } from "@/shared/ui";
import { routes } from "@/shared/config/routes";
import { extractIdea, startManualDiagnostic, type IdeaExtract } from "../api/actions";
import { savePendingDiagnostic } from "../lib/pending";

type Step = "tell" | "organize" | "fill";

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
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>(initialExtract ? "organize" : "tell");
  const [idea, setIdea] = useState(initialDescription);
  const [name, setName] = useState(initialExtract?.project_name ?? "");
  const [consent, setConsent] = useState(!!initialExtract); // déjà consenti via upload
  const [extract, setExtract] = useState<IdeaExtract | null>(initialExtract ?? null);
  const [gapIdx, setGapIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");

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
      const res = await extractIdea(idea.trim(), name.trim() || undefined);
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
    setDraft("");
    setStep("fill");
  }

  function validateGap() {
    if (!extract) return;
    const gap = extract.gaps[gapIdx];
    const next = { ...answers, [gap.key]: draft.trim() };
    setAnswers(next);
    if (gapIdx + 1 < extract.gaps.length) {
      setGapIdx(gapIdx + 1);
      setDraft("");
    } else {
      submit(next);
    }
  }

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
        <Field label={t("nameLabel")}>
          <Input
            placeholder={t("namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
          />
        </Field>
        <Field
          label={t("ideaLabel")}
          description={t("ideaDescription")}
        >
          <Textarea
            rows={6}
            placeholder={t("ideaPlaceholder")}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />
        </Field>
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
    return (
      <div className="space-y-5">
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
          <div className="mt-3 flex justify-end">
            <Button onClick={validateGap} loading={pending} disabled={!draft.trim()}>
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
