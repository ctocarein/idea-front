"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, Mic, Wand2 } from "lucide-react";

import { Button, Checkbox, Field, Input, Textarea, toast } from "@/shared/ui";
import { routes } from "@/shared/config/routes";
import { type IdeaExtract } from "../api/actions";
import { savePendingDiagnostic } from "../lib/pending";
import { useDictation } from "../lib/use-dictation";

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

/** Bouton micro (dictée) — icône seule. Rendu uniquement si la Web Speech API est supportée. */
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
  const label = listening ? listeningLabel : startLabel;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={listening}
      aria-label={label}
      title={label}
      className={`inline-flex size-8 items-center justify-center rounded-full border transition-colors ${
        listening
          ? "border-coral-strong/40 bg-coral/10 text-coral-strong"
          : "text-muted-foreground hover:text-foreground hover:border-border-strong"
      }`}
    >
      <Mic className={`size-4 ${listening ? "animate-pulse" : ""}`} />
    </button>
  );
}

/**
 * « Raconte, on structure » — l'inverse du formulaire. Le porteur raconte son idée ; on la
 * **stashe brute** et on passe **la porte**. L'organisation en 12 dimensions par le LLM ne se
 * fait plus ici : elle a été déplacée **après l'inscription**, à l'entrée du wizard
 * `/dashboard/ajuster` (AdjustProjectClient), pour ne dépenser aucun appel LLM en anonyme.
 *
 *  - anonyme → teaser (création de compte) : aperçu flouté générique, `extract` toujours `null` ;
 *  - connecté → il a déjà un compte → droit au wizard, qui organisera à son ouverture.
 *
 * On stashe la devise et la langue choisies : l'extraction (désormais post-inscription) les rejoue.
 *
 * `initialExtract` + `initialDescription` : passés par UploadDiagnostic (connecté) quand le texte
 * a déjà été extrait d'un fichier → on stashe AVEC l'extract et on passe la porte (pas de re-LLM).
 */
export function RaconteDiagnostic({
  isAuthed = false,
  onAnonSubmit,
  initialExtract,
  initialDescription = "",
}: {
  isAuthed?: boolean;
  onAnonSubmit?: (projectName: string) => void;
  /** Pré-extraction depuis un fichier uploadé — passe la porte directement. */
  initialExtract?: IdeaExtract;
  /** Texte extrait du fichier (utilisé comme `description` dans le payload de scoring). */
  initialDescription?: string;
}) {
  const router = useRouter();
  const t = useTranslations("Diagnostic.raconte");
  const locale = useLocale();
  const [idea, setIdea] = useState(initialDescription);
  const [name, setName] = useState(initialExtract?.project_name ?? "");
  // Consentement pré-coché si déjà consenti via upload, ou si le porteur est connecté (il a
  // accepté le RGPD à la création de compte — inutile de le redemander pour chaque idée).
  const [consent, setConsent] = useState(!!initialExtract || isAuthed);
  const [currency, setCurrency] = useState(locale === "en" ? "USD" : "XOF");

  // Dictée vocale : la voix alimente le récit (seul champ libre du parcours désormais).
  const { supported: micSupported, listening, toggle: toggleMic } = useDictation(
    locale,
    (chunk) => setIdea((prev) => appendSpeech(prev, chunk)),
    (code) => {
      const key =
        code === "not-allowed" || code === "service-not-allowed"
          ? "voiceErrDenied"
          : code === "audio-capture"
            ? "voiceErrNoMic"
            : code === "no-speech"
              ? "voiceErrNoSpeech"
              : "voiceErrGeneric";
      toast.error(t(key));
    },
  );

  function buildPayload() {
    return {
      projectName: (name.trim() || initialExtract?.project_name || "Mon projet").slice(0, 120),
      sector: "autre",
      description: idea.trim(),
      consent: true,
      answers: {}, // les réponses arrivent au wizard, sur /dashboard/ajuster
    };
  }

  /**
   * On stashe le récit et on passe la porte (compte requis avant le wizard).
   * `extract` reste `null` dans le cas normal (récit tapé) : l'IA organisera après l'inscription.
   * Il n'est renseigné que sur le chemin upload connecté, où le texte a déjà été extrait.
   */
  function proceed(extract: IdeaExtract | null = null) {
    const payload = buildPayload();
    savePendingDiagnostic(payload, extract, { currency, lang: locale });
    if (isAuthed) router.push(routes.ajuster);
    else onAnonSubmit?.(payload.projectName);
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
    // Plus d'extraction ici : on stashe le récit brut et on passe la porte. Le LLM organise
    // à l'entrée du wizard, une fois le porteur inscrit (zéro appel LLM en anonyme).
    proceed();
  }

  // Upload connecté : le fichier a déjà été extrait → on stashe AVEC l'extract et on passe la porte.
  useEffect(() => {
    if (initialExtract) proceed(initialExtract);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upload : rien à saisir, on montre juste la transition (le useEffect enchaîne).
  if (initialExtract) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        {t("preparing")}
      </div>
    );
  }

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
      <Field label={t("ideaLabel")}>
        <Textarea
          rows={6}
          placeholder={t("ideaPlaceholder")}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
      </Field>
      <div className="-mt-2 flex items-center justify-between gap-2">
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
        {micSupported && (
          <MicButton
            listening={listening}
            onToggle={toggleMic}
            startLabel={t("voiceStart")}
            listeningLabel={t("voiceListening")}
          />
        )}
      </div>
      <Checkbox
        checked={consent}
        onCheckedChange={(v) => setConsent(v === true)}
        label={t("consent")}
      />
      <Button onClick={organize} className="w-full">
        <Wand2 className="size-5" />
        {t("organizeCta")}
      </Button>
    </div>
  );
}
