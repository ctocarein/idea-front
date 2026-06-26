"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Loader2,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Send,
  Volume2,
  X,
} from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Badge, Button, toast } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { deliberate, endPitch, narrate, respond, shareDeck, startPitch } from "../actions";
import type { Committee, PitchSession, PitchTurn } from "../api";
import { createRecognizer, speak, speechSupported, stopSpeaking } from "../lib/speech";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Couleur d'ambiance d'un juge selon sa conviction (−2..+2). */
function convictionRing(value: number): string {
  if (value >= 1) return "ring-emerald-400/70";
  if (value <= -1) return "ring-amber-400/70";
  return "ring-white/10";
}
function convictionLabel(value: number): { text: string; cls: string } {
  if (value >= 1) return { text: "convaincu", cls: "text-emerald-300" };
  if (value <= -1) return { text: "sceptique", cls: "text-amber-300" };
  return { text: "neutre", cls: "text-neutral-400" };
}

/** Tuile « participant » d'un juge — façon vignette de visio. */
function JudgeTile({
  name,
  role,
  conviction,
  speaking,
  compact,
  onListen,
}: {
  name: string;
  role: string;
  conviction: number;
  speaking: boolean;
  compact?: boolean;
  onListen?: () => void;
}) {
  const conv = convictionLabel(conviction);
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-neutral-800 ring-1 transition-all",
        compact ? "aspect-video p-2" : "aspect-video p-3",
        speaking
          ? "ring-2 ring-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.18)]"
          : convictionRing(conviction),
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 font-bold text-white",
          compact ? "size-9 text-xs" : "size-14 text-lg",
        )}
      >
        {initials(name)}
      </div>

      {/* barres « audio » animées quand le juge parle */}
      {speaking ? (
        <div className="mt-2 flex items-end gap-0.5" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-1 animate-pulse rounded-full bg-emerald-400"
              style={{ height: `${6 + (i % 2 ? 10 : 4)}px`, animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      ) : null}

      {/* bandeau nom, bas-gauche (comme Meet) */}
      <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1">
        <div className="min-w-0 rounded-md bg-black/45 px-1.5 py-0.5 backdrop-blur-sm">
          <p className="truncate text-[11px] font-medium text-white">{name}</p>
          {!compact ? (
            <p className="truncate text-[10px] text-neutral-300">{role}</p>
          ) : null}
        </div>
        {!compact ? (
          <span className={cn("rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-sm", conv.cls)}>
            {speaking ? "parle" : conv.text}
          </span>
        ) : null}
      </div>

      {onListen && !speaking ? (
        <button
          type="button"
          onClick={onListen}
          aria-label={`Écouter ${name}`}
          className="absolute right-1.5 top-1.5 rounded-full bg-black/40 p-1 text-neutral-300 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
        >
          <Volume2 className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/** Tuile du porteur (toi). */
function PorteurTile({ listening, compact }: { listening: boolean; compact?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-coral/25 to-neutral-800 ring-1 ring-coral-strong/40",
        compact ? "aspect-video p-2" : "aspect-video p-3",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-coral-strong font-bold text-white",
          compact ? "size-9 text-xs" : "size-14 text-lg",
        )}
      >
        VOUS
      </div>
      <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between">
        <span className="rounded-md bg-black/45 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          Vous
        </span>
        <span className="rounded-md bg-black/45 p-1 backdrop-blur-sm">
          {listening ? (
            <Mic className="size-3.5 text-emerald-300" />
          ) : (
            <MicOff className="size-3.5 text-neutral-400" />
          )}
        </span>
      </div>
    </div>
  );
}

/** Bouton rond de la barre de contrôle (façon Meet). */
function ControlButton({
  label,
  onClick,
  active,
  danger,
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-11 items-center justify-center rounded-full transition-colors disabled:opacity-40",
        danger
          ? "bg-red-500 text-white hover:bg-red-600"
          : active
            ? "bg-coral-strong text-white"
            : "bg-neutral-700 text-neutral-100 hover:bg-neutral-600",
      )}
    >
      {children}
    </button>
  );
}

/** Légendes / captions latérales (le transcript, façon panneau Meet). */
function Captions({ turns }: { turns: PitchTurn[] }) {
  const visible = turns.filter((t) => t.actor !== "systeme");
  return (
    <div className="flex h-full flex-col rounded-xl bg-neutral-800/60 ring-1 ring-white/10">
      <p className="border-b border-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Échanges
      </p>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {visible.length === 0 ? (
          <p className="text-sm text-neutral-500">La séance va commencer…</p>
        ) : (
          visible.map((t) => {
            const mine = t.actor === "porteur";
            const axis = (t.meta as { axis?: string } | null)?.axis;
            return (
              <div key={t.seq} className="text-sm">
                <p
                  className={cn(
                    "mb-0.5 flex items-center gap-2 text-xs font-semibold",
                    mine ? "text-coral-strong" : "text-neutral-300",
                  )}
                >
                  {mine ? "Vous" : t.actor}
                  {axis ? <Badge variant="primary">{axis}</Badge> : null}
                  {!mine ? (
                    <button
                      type="button"
                      onClick={() => speak(t.content, t.actor)}
                      aria-label={`Écouter ${t.actor}`}
                      className="ml-auto text-neutral-500 transition-colors hover:text-white"
                    >
                      <Volume2 className="size-3.5" />
                    </button>
                  ) : null}
                </p>
                <p className={cn("leading-relaxed", mine ? "text-neutral-200" : "text-neutral-300")}>
                  {t.content.replace(/^[^:]+:\s*/, "")}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function PitchRoom({
  session: initial,
  committee,
}: {
  session: PitchSession;
  committee: Committee | null;
}) {
  const router = useRouter();
  const [session, setSession] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [mounted, setMounted] = useState(false);
  const recRef = useRef<ReturnType<typeof createRecognizer>>(null);

  // --- Partage de slides (présentation type « partage d'écran ») ---
  // Au chargement, on ré-affiche le deck déjà partagé (persisté dans la session).
  const persistedSlide = initial.deck?.file_url
    ? [{ url: initial.deck.file_url, isPdf: (initial.deck.content_type ?? "").includes("pdf") }]
    : [];
  const [slides, setSlides] = useState<{ url: string; isPdf: boolean }[]>(persistedSlide);
  const [slideIdx, setSlideIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const presenting = slides.length > 0;

  const phase = session.phase;
  const turns = (session.turns ?? []) as PitchTurn[];
  const convictions = (session.convictions ?? {}) as Record<string, number>;
  const lastQuestion = [...turns].reverse().find((t) => t.kind === "question");
  const speaker = lastQuestion?.actor ?? null;
  const lastTurn = turns[turns.length - 1];
  const awaitingAnswer = lastTurn?.kind === "question";
  const answerTargetS = Number(
    (session.config as Record<string, unknown> | null)?.answer_target_s ?? 45,
  );
  const fmt = String((session.config as Record<string, unknown> | null)?.format ?? "standard");

  const personas = committee?.personas ?? [];
  const roleOf = (name: string) => personas.find((p) => p.name === name)?.role ?? "";
  const judgeNames = personas.map((p) => p.name);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => {
      stopSpeaking();
      recRef.current?.stop();
    };
  }, []);
  const canDictate = mounted && speechSupported();

  // Lecture vocale automatique de la dernière question du juge.
  const lastQuestionSeq = lastQuestion?.seq;
  useEffect(() => {
    if (lastQuestion && (phase === "qa" || phase === "free_round")) {
      speak(lastQuestion.content, lastQuestion.actor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastQuestionSeq]);

  // Révoque les object URLs des slides au démontage.
  useEffect(() => {
    return () => slides.forEach((s) => URL.revokeObjectURL(s.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPickFiles(files: FileList | null) {
    if (!files) return;
    const picked = Array.from(files).filter(
      (f) => f.type === "application/pdf" || f.type.startsWith("image/"),
    );
    if (picked.length === 0) {
      toast.error("Choisis un PDF ou des images de tes slides (exporte ton PowerPoint en PDF).");
      return;
    }
    // On ne révoque que les blobs locaux (pas l'URL présignée d'un deck déjà persisté).
    slides.forEach((s) => s.url.startsWith("blob:") && URL.revokeObjectURL(s.url));
    const pdf = picked.find((f) => f.type === "application/pdf");
    const next = pdf
      ? [{ url: URL.createObjectURL(pdf), isPdf: true }]
      : picked.map((f) => ({ url: URL.createObjectURL(f), isPdf: false }));
    setSlides(next); // aperçu instantané
    setSlideIdx(0);

    // Persistance : on envoie le fichier principal (PDF, sinon 1re image) → rattaché à la session.
    const primary = pdf ?? picked[0];
    const fd = new FormData();
    fd.append("file", primary);
    setUploading(true);
    shareDeck(session.id, fd)
      .then((res) => {
        if (res.ok) setSession(res.session);
        else toast.error(res.message);
      })
      .finally(() => setUploading(false));
  }

  function stopPresenting() {
    slides.forEach((s) => URL.revokeObjectURL(s.url));
    setSlides([]);
    setSlideIdx(0);
  }

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    stopSpeaking();
    const rec = createRecognizer(
      (text) => setDraft((d) => (d ? `${d} ${text}` : text)),
      () => setListening(false),
    );
    if (!rec) {
      toast.error("La dictée vocale n'est pas disponible sur ce navigateur.");
      return;
    }
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  function run(action: () => ReturnType<typeof startPitch>, clearDraft = true) {
    startTransition(async () => {
      const res = await action();
      if (res.ok) {
        setSession(res.session);
        if (clearDraft) setDraft("");
      } else {
        toast.error(res.message);
      }
    });
  }

  // ---- Statut de phase (bandeau haut) ----
  const phaseLabel: Record<string, string> = {
    briefing: "En attente — le comité t'écoute",
    pitching: "Tu présentes",
    qa: "Questions du jury",
    free_round: "Tour libre",
    deliberating: "Délibération…",
    completed: "Séance terminée",
  };

  const hasNarrated = turns.some((t) => t.kind === "narration");
  const showInput =
    phase === "pitching" || ((phase === "qa" || phase === "free_round") && awaitingAnswer);
  const inputPlaceholder =
    phase === "pitching"
      ? "Déroule ton pitch… (tu peux narrer en plusieurs fois)"
      : speaker
        ? `Ta réponse à ${speaker}…`
        : "Ta réponse…";

  // ---- Scène centrale (fonction de rendu, pas un composant : capte l'état local) ----
  function renderStage() {
    if (presenting) {
      const current = slides[slideIdx];
      return (
        <div className="relative flex h-full items-center justify-center bg-black">
          {current?.isPdf ? (
            <object data={current.url} type="application/pdf" className="h-full w-full">
              <p className="p-4 text-sm text-neutral-300">
                Aperçu PDF indisponible — ton navigateur ne sait pas l&apos;afficher en ligne.
              </p>
            </object>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current?.url}
              alt={`Slide ${slideIdx + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          )}

          {/* navigation images */}
          {!current?.isPdf && slides.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                disabled={slideIdx === 0}
                aria-label="Slide précédente"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white disabled:opacity-30"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setSlideIdx((i) => Math.min(slides.length - 1, i + 1))}
                disabled={slideIdx === slides.length - 1}
                aria-label="Slide suivante"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white disabled:opacity-30"
              >
                <ChevronRight className="size-5" />
              </button>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
                {slideIdx + 1} / {slides.length}
              </span>
            </>
          ) : null}

          <button
            type="button"
            onClick={stopPresenting}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80"
          >
            <X className="size-3.5" />
            Arrêter de présenter
          </button>
          {uploading ? (
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
              <Loader2 className="size-3.5 animate-spin" />
              Enregistrement…
            </span>
          ) : null}
        </div>
      );
    }

    // Pas de présentation : gallery des juges (ou spotlight du locuteur).
    if (speaker) {
      const conv = convictions[speaker] ?? 0;
      return (
        <div className="flex h-full items-center justify-center p-4">
          <div className="w-full max-w-md">
            <JudgeTile
              name={speaker}
              role={roleOf(speaker)}
              conviction={conv}
              speaking
            />
          </div>
        </div>
      );
    }

    return (
      <div className="grid h-full place-content-center gap-4 p-6 text-center">
        <p className="text-sm text-neutral-400">
          {phase === "pitching"
            ? "Tu as la parole. Le comité réagit en silence — lis les visages."
            : "Le comité t'écoute. Personne ne te coupera."}
        </p>
        <div className="mx-auto grid grid-cols-2 gap-2 sm:grid-cols-3">
          {judgeNames.slice(0, 6).map((name) => (
            <div key={name} className="w-28">
              <JudgeTile
                name={name}
                role={roleOf(name)}
                conviction={convictions[name] ?? 0}
                speaking={false}
                compact
                onListen={undefined}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Délibération : overlay plein ----
  const deliberating = phase === "deliberating";
  const completed = phase === "completed";

  return (
    <div className="overflow-hidden rounded-3xl bg-neutral-900 text-neutral-100 ring-1 ring-white/10">
      {/* Barre d'état */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-sm font-medium">{phaseLabel[phase] ?? "Séance"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="rounded-full bg-neutral-800 px-2 py-0.5 capitalize">{fmt}</span>
          <span className="hidden sm:inline">{personas.length} juges</span>
        </div>
      </div>

      {/* Scène + tuiles + captions */}
      <div className="grid gap-3 p-3 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {/* Scène principale */}
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-neutral-950 ring-1 ring-white/10">
            {deliberating ? (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <Loader2 className="size-9 animate-spin text-coral-strong" />
                <p className="text-neutral-300">Le comité délibère…</p>
                <button
                  type="button"
                  onClick={() => run(() => deliberate(session.id), false)}
                  className="rounded-full bg-neutral-700 px-3 py-1.5 text-xs hover:bg-neutral-600"
                >
                  Rafraîchir
                </button>
              </div>
            ) : completed ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <Gavel className="size-9 text-coral-strong" />
                <h2 className="font-display text-xl font-bold">Le verdict est tombé</h2>
                <Button asChild>
                  <Link href={`${routes.pitchSimSession(session.id)}?view=report`}>
                    Voir mon post-mortem
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
              </div>
            ) : (
              renderStage()
            )}
          </div>

          {/* Filmstrip des juges quand on présente (sinon la gallery est dans la scène) */}
          {presenting && !deliberating && !completed ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              <PorteurTile listening={listening} compact />
              {judgeNames.map((name) => (
                <JudgeTile
                  key={name}
                  name={name}
                  role={roleOf(name)}
                  conviction={convictions[name] ?? 0}
                  speaking={name === speaker}
                  compact
                />
              ))}
            </div>
          ) : null}

          {/* Zone de saisie (pitch / réponse) */}
          {showInput && !deliberating && !completed ? (
            <div className="rounded-2xl bg-neutral-800/70 p-3 ring-1 ring-white/10">
              <textarea
                rows={2}
                placeholder={inputPlaceholder}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full resize-none rounded-lg bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-coral-strong/40"
              />
              {phase === "qa" || phase === "free_round" ? (
                <p className="mt-1.5 text-xs text-neutral-400">
                  Vise &lt; {answerTargetS}&nbsp;s — concis, le jury enchaîne plus de questions.
                </p>
              ) : !hasNarrated ? (
                <p className="mt-1.5 text-xs text-neutral-400">
                  Présente au moins une partie de ton pitch avant de terminer.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Captions (échanges) */}
        <div className="hidden h-[420px] lg:block">
          <Captions turns={turns} />
        </div>
      </div>

      {/* Barre de contrôle */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 bg-neutral-900/80 px-4 py-3 backdrop-blur">
        {canDictate ? (
          <ControlButton
            label={listening ? "Arrêter la dictée" : "Parler (dictée)"}
            onClick={toggleMic}
            active={listening}
          >
            {listening ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </ControlButton>
        ) : null}

        <ControlButton
          label={presenting ? "Changer de slides" : "Présenter mes slides"}
          onClick={() => fileRef.current?.click()}
          active={presenting}
          disabled={deliberating || completed}
        >
          <MonitorUp className="size-5" />
        </ControlButton>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,image/*"
          multiple
          hidden
          onChange={(e) => onPickFiles(e.target.files)}
        />

        {/* Action principale contextuelle */}
        <div className="mx-1 flex items-center gap-2">
          {phase === "briefing" ? (
            <Button onClick={() => run(() => startPitch(session.id))} loading={pending}>
              Commencer mon pitch
              <ArrowRight className="size-4" />
            </Button>
          ) : null}

          {phase === "pitching" ? (
            <>
              <Button
                variant="outline"
                disabled={!draft.trim() || pending}
                onClick={() => run(() => narrate(session.id, draft.trim()))}
              >
                <Send className="size-4" />
                Continuer
              </Button>
              <Button
                disabled={!hasNarrated || pending}
                onClick={() => run(() => endPitch(session.id), false)}
              >
                J&apos;ai terminé
              </Button>
            </>
          ) : null}

          {(phase === "qa" || phase === "free_round") && awaitingAnswer ? (
            <Button
              onClick={() => draft.trim() && run(() => respond(session.id, draft.trim()))}
              loading={pending}
            >
              <Send className="size-4" />
              Répondre
            </Button>
          ) : null}

          {(phase === "qa" || phase === "free_round") && !awaitingAnswer ? (
            <Button onClick={() => run(() => deliberate(session.id), false)} loading={pending}>
              <Gavel className="size-4" />
              Faire délibérer
            </Button>
          ) : null}
        </div>

        <ControlButton label="Quitter la salle" onClick={() => router.push(routes.pitchSim)} danger>
          <PhoneOff className="size-5" />
        </ControlButton>
      </div>
    </div>
  );
}
