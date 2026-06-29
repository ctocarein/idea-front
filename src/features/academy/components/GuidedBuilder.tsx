"use client";

import { useRef, useState, useTransition } from "react";
import { Send, Sparkles } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button, Textarea, toast } from "@/shared/ui";
import {
  startGuidedSession,
  sendGuidedTurn,
  saveGuidedDraft,
  type GuidedSessionData,
} from "../actions";

/**
 * Construire guidé (BESOINS_PORTEUR cas 2) : le porteur ÉCRIT, le coach IA explique et
 * questionne. Le porteur reste l'auteur — le coach ne rédige jamais à sa place.
 *
 * Sessions réelles : POST /academy/build/start → POST /turn → PATCH /draft (auto-save).
 */

const SECTIONS = [
  { key: "probleme",          label: "Le problème" },
  { key: "solution",          label: "Ma solution" },
  { key: "marche",            label: "Mon marché" },
  { key: "concurrence",       label: "Mes concurrents" },
  { key: "modele_economique", label: "Mon modèle économique" },
  { key: "go_to_market",      label: "Mon Go-to-Market" },
  { key: "croissance",        label: "Potentiel de croissance" },
  { key: "avancement",        label: "Où j'en suis" },
  { key: "risques",           label: "Mes risques & freins" },
] as const;

type Turn = { role: "porteur" | "coach"; text: string };

const INTRO: Turn = {
  role: "coach",
  text: "On construit ta version ensemble. Commence par écrire une première phrase dans ton brouillon ci-dessus — je t'aide à la rendre plus claire et plus solide.",
};

function buildTurns(raw: GuidedSessionData["turns"]): Turn[] {
  const parsed = raw.flatMap((t) => {
    const role = t["role"];
    const text = t["text"];
    if ((role === "porteur" || role === "coach") && typeof text === "string") {
      return [{ role, text } as Turn];
    }
    return [];
  });
  return [INTRO, ...parsed];
}

export function GuidedBuilder() {
  const [phase, setPhase] = useState<"pick" | "session">("pick");
  const [section, setSection] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleDraftChange(value: string) {
    setDraft(value);
    setDraftSaved(false);
    if (!sessionId) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      startTransition(async () => {
        await saveGuidedDraft(sessionId, value);
        setDraftSaved(true);
      });
    }, 1200);
  }

  function handleStart(key: string) {
    setSection(key);
    startTransition(async () => {
      const res = await startGuidedSession(key);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      setSessionId(res.session.id);
      setTurns(buildTurns(res.session.turns));
      setDraft(res.session.draft);
      setPhase("session");
    });
  }

  function handleSend() {
    const text = chatInput.trim();
    if (!text || !sessionId) return;
    setChatInput("");
    startTransition(async () => {
      const res = await sendGuidedTurn(sessionId, text);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      setTurns(buildTurns(res.session.turns));
    });
  }

  if (phase === "pick") {
    return (
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <Sparkles className="size-5 text-coral-strong" />
          <h3 className="font-display text-base font-bold">Construire ma version, guidé</h3>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Choisis la section que tu veux travailler. Tu écris, le coach te questionne — il ne rédige jamais à ta place.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => handleStart(s.key)}
                disabled={isPending}
                className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-left text-sm font-medium transition-colors hover:border-coral-strong hover:bg-coral/5 disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sectionLabel = SECTIONS.find((s) => s.key === section)?.label ?? section;

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-coral-strong" />
          <h3 className="font-display text-base font-bold">{sectionLabel}</h3>
        </div>
        <button
          onClick={() => { setPhase("pick"); setSessionId(null); setTurns([]); setDraft(""); }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Changer de section
        </button>
      </div>

      {/* Brouillon du porteur */}
      <div className="border-b border-border p-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Mon brouillon
          </p>
          {draftSaved ? (
            <span className="text-xs text-success">Sauvegardé ✓</span>
          ) : null}
        </div>
        <Textarea
          value={draft}
          onChange={(e) => handleDraftChange(e.target.value)}
          rows={4}
          placeholder="Commence à écrire ta version ici…"
          className="resize-none"
        />
      </div>

      {/* Chat avec le coach */}
      <div className="max-h-64 space-y-3 overflow-y-auto p-5">
        {turns.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "porteur" ? "justify-end" : "justify-start")}>
            <p
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                m.role === "porteur"
                  ? "bg-coral-strong text-white"
                  : "bg-secondary text-foreground",
              )}
            >
              {m.text}
            </p>
          </div>
        ))}
        {isPending ? (
          <div className="flex justify-start">
            <p className="max-w-[85%] rounded-2xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground animate-pulse">
              Le coach réfléchit…
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex items-end gap-2 border-t border-border p-3">
        <Textarea
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={2}
          placeholder="Pose une question au coach ou partage une réflexion…"
          className="min-h-11 flex-1 resize-none"
          disabled={isPending}
        />
        <Button
          onClick={handleSend}
          size="icon"
          aria-label="Envoyer"
          disabled={!chatInput.trim() || isPending}
          loading={isPending}
        >
          <Send className="size-5" />
        </Button>
      </div>
    </div>
  );
}
