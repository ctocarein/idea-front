"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
      toast.error("Raconte un peu plus — 2 ou 3 phrases suffisent.");
      return;
    }
    if (!consent) {
      toast.error("Coche le consentement RGPD pour lancer l'analyse.");
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
        <Field label="Ton projet a déjà un nom ? (optionnel)">
          <Input
            placeholder="Ex. AgriConnect"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
          />
        </Field>
        <Field
          label="Raconte ton projet"
          description="En 3 phrases : le problème, ta solution, où tu en es. Pas de structure à respecter."
        >
          <Textarea
            rows={6}
            placeholder="Mon projet aide…"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />
        </Field>
        <Checkbox
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          label="J'accepte que mon idée soit analysée (RGPD)."
        />
        <Button onClick={organize} loading={pending} className="w-full">
          <Wand2 className="size-5" />
          On organise mon idée
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
          On a capté{" "}
          <span className="font-medium text-ink">
            {extract.captured_count} dimensions sur {extract.total}
          </span>
          {extract.gaps.length > 0 ? ` — il nous manque ${extract.gaps.length} choses.` : "."}
        </div>
        {chips(extract)}
        <Button onClick={startFill} loading={pending} className="w-full">
          {extract.gaps.length > 0
            ? `Compléter (${extract.gaps.length} question${extract.gaps.length > 1 ? "s" : ""})`
            : "Voir mon bilan"}
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
            placeholder="En une phrase…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <Button onClick={validateGap} loading={pending} disabled={!draft.trim()}>
              {gapIdx + 1 < extract.gaps.length ? "Valider" : "Terminer"}
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
      On prépare ton bilan…
    </div>
  );
}
