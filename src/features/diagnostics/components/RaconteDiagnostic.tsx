"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, Mic, Wand2 } from "lucide-react";

import { Button, Checkbox, Field, Input, Textarea, toast } from "@/shared/ui";
import { routes } from "@/shared/config/routes";
import { extractIdea, type IdeaExtract } from "../api/actions";
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
 * « Raconte, on structure » — l'inverse du formulaire. Le porteur raconte son idée ; le LLM
 * l'organise en 12 dimensions **rédigées**.
 *
 * Puis, quel que soit le porteur, le récit organisé est stashé et on passe **la porte** :
 *  - anonyme → teaser (création de compte) : le wizard de relecture mérite un compte ;
 *  - connecté → il a déjà un compte → droit au wizard, sur `/dashboard/ajuster`.
 *
 * Le wizard de relecture ne vit plus ici : il est servi UNIQUEMENT par `/dashboard/ajuster`
 * (AdjustProjectClient), derrière la porte de compte. Il n'y a donc plus de raccourci
 * « connecté → wizard inline » ni d'écran d'aperçu intermédiaire.
 *
 * `initialExtract` + `initialDescription` : passés par UploadDiagnostic quand le texte a déjà
 * été extrait d'un fichier → on stashe et on passe la porte directement (pas de saisie).
 */
export function RaconteDiagnostic({
  isAuthed = false,
  onAnonSubmit,
  initialExtract,
  initialDescription = "",
}: {
  isAuthed?: boolean;
  onAnonSubmit?: (projectName: string, extract: IdeaExtract | null) => void;
  /** Pré-extraction depuis un fichier uploadé — passe la porte directement. */
  initialExtract?: IdeaExtract;
  /** Texte extrait du fichier (utilisé comme `description` dans le payload de scoring). */
  initialDescription?: string;
}) {
  const router = useRouter();
  const t = useTranslations("Diagnostic.raconte");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [idea, setIdea] = useState(initialDescription);
  const [name, setName] = useState(initialExtract?.project_name ?? "");
  const [consent, setConsent] = useState(!!initialExtract); // déjà consenti via upload
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

  /** Récit organisé → on stashe et on passe la porte (compte requis avant le wizard). */
  function proceed(extract: IdeaExtract) {
    const payload = buildPayload();
    savePendingDiagnostic(payload, extract);
    if (isAuthed) router.push(routes.ajuster);
    else onAnonSubmit?.(payload.projectName, extract);
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
      proceed(res.data);
    });
  }

  // Upload : le fichier a déjà été extrait → on stashe et on passe la porte au montage.
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
      <Button onClick={organize} loading={pending} className="w-full">
        <Wand2 className="size-5" />
        {t("organizeCta")}
      </Button>
    </div>
  );
}
