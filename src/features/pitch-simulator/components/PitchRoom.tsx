"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Gavel,
  Loader2,
  Send,
  Smile,
  Meh,
  Frown,
  User,
} from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Badge, Button, Card, CardContent, Textarea, toast } from "@/shared/ui";
import { deliberate, endPitch, narrate, respond, startPitch } from "../actions";
import type { Committee, PitchSession, PitchTurn } from "../api";

/** Signal de conviction d'un juge (−2..+2) → visage + couleur. */
function ConvictionFace({ value }: { value: number }) {
  if (value >= 1)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-success">
        <Smile className="size-3.5" /> convaincu
      </span>
    );
  if (value <= -1)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-warning">
        <Frown className="size-3.5" /> sceptique
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Meh className="size-3.5" /> neutre
    </span>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Le banc du comité : un visage par juge + sa conviction ; le locuteur est mis en avant. */
function CommitteeBench({
  committee,
  convictions,
  speaker,
}: {
  committee: Committee | null;
  convictions: Record<string, number>;
  speaker: string | null;
}) {
  const names = committee?.personas.map((p) => p.name) ?? Object.keys(convictions);
  const roleOf = (name: string) =>
    committee?.personas.find((p) => p.name === name)?.role ?? "";

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {names.map((name) => {
        const speaking = name === speaker;
        return (
          <div
            key={name}
            className={`rounded-xl border bg-card p-3 text-center ${
              speaking ? "border-coral-strong ring-2 ring-coral-strong/20" : "border-border"
            }`}
          >
            <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-bold">
              {initials(name)}
            </div>
            <p className="mt-1.5 truncate text-xs font-medium">{name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{roleOf(name)}</p>
            <div className="mt-1">
              {speaking ? (
                <span className="text-[11px] font-medium text-coral-strong">parle</span>
              ) : (
                <ConvictionFace value={convictions[name] ?? 0} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Transcript : narrations du porteur + questions des juges (on masque les lignes système). */
function Transcript({ turns }: { turns: PitchTurn[] }) {
  const visible = turns.filter((t) => t.actor !== "systeme");
  if (visible.length === 0) return null;
  return (
    <div className="space-y-3">
      {visible.map((t) => {
        const mine = t.actor === "porteur";
        const axis = (t.meta as { axis?: string } | null)?.axis;
        return (
          <div key={t.seq} className={`flex gap-2 ${mine ? "justify-end" : ""}`}>
            {!mine ? (
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold">
                {initials(t.actor)}
              </div>
            ) : null}
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                mine ? "bg-coral/15 text-ink" : "border border-border bg-card"
              }`}
            >
              {!mine ? (
                <p className="mb-0.5 flex items-center gap-2 text-xs font-medium">
                  {t.actor}
                  {axis ? <Badge variant="primary">{axis}</Badge> : null}
                </p>
              ) : null}
              <p className="leading-relaxed">{t.content.replace(/^[^:]+:\s*/, "")}</p>
            </div>
            {mine ? (
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-coral/20 text-coral-strong">
                <User className="size-3.5" />
              </div>
            ) : null}
          </div>
        );
      })}
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
  const [session, setSession] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState("");

  const phase = session.phase;
  const turns = (session.turns ?? []) as PitchTurn[];
  const convictions = (session.convictions ?? {}) as Record<string, number>;
  const lastQuestion = [...turns].reverse().find((t) => t.kind === "question");
  const speaker = lastQuestion?.actor ?? null;
  const lastTurn = turns[turns.length - 1];
  const awaitingAnswer = lastTurn?.kind === "question";

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

  // BRIEFING — le comité attend.
  if (phase === "briefing") {
    return (
      <div className="space-y-6">
        <CommitteeBench committee={committee} convictions={convictions} speaker={null} />
        <Card>
          <CardContent className="space-y-3 py-8 text-center">
            <h2 className="font-display text-xl font-bold">Le comité t&apos;écoute</h2>
            <p className="mx-auto max-w-md text-muted-foreground">
              Tu as la parole. Personne ne te coupera — c&apos;est toi qui annonceras la fin.
            </p>
            <Button onClick={() => run(() => startPitch(session.id))} loading={pending}>
              Commencer mon pitch
              <ArrowRight className="size-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // PITCHING — le porteur narre, le comité réagit en silence.
  if (phase === "pitching") {
    const hasNarrated = turns.some((t) => t.kind === "narration");
    return (
      <div className="space-y-5">
        <CommitteeBench committee={committee} convictions={convictions} speaker={null} />
        <Transcript turns={turns} />
        <div className="space-y-2">
          <Textarea
            rows={3}
            placeholder="Déroule ton pitch… (tu peux narrer en plusieurs fois)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              disabled={!draft.trim() || pending}
              onClick={() => run(() => narrate(session.id, draft.trim()))}
              loading={pending}
            >
              <Send className="size-4" />
              Continuer
            </Button>
            <Button
              disabled={!hasNarrated || pending}
              onClick={() => run(() => endPitch(session.id), false)}
              loading={pending}
            >
              J&apos;ai terminé
            </Button>
            {!hasNarrated ? (
              <span className="text-xs text-muted-foreground">
                Présente au moins une partie de ton pitch d&apos;abord.
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Q&A / TOUR LIBRE — un juge interroge, le porteur répond ; sinon, on délibère.
  if (phase === "qa" || phase === "free_round") {
    return (
      <div className="space-y-5">
        <CommitteeBench committee={committee} convictions={convictions} speaker={speaker} />
        <Transcript turns={turns} />
        {awaitingAnswer ? (
          <div className="space-y-2">
            <Textarea
              rows={3}
              placeholder={speaker ? `Ta réponse à ${speaker}…` : "Ta réponse…"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button
              onClick={() => draft.trim() && run(() => respond(session.id, draft.trim()))}
              loading={pending}
            >
              <Send className="size-4" />
              Répondre
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-6">
              <p className="text-sm text-muted-foreground">
                Le comité a terminé ses questions. Prêt pour le verdict&nbsp;?
              </p>
              <Button onClick={() => run(() => deliberate(session.id), false)} loading={pending}>
                <Gavel className="size-4" />
                Faire délibérer
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // DELIBERATING — transition.
  if (phase === "deliberating") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Loader2 className="size-9 animate-spin text-coral-strong" />
        <p className="text-muted-foreground">Le comité délibère…</p>
        <Button variant="outline" size="sm" onClick={() => run(() => deliberate(session.id), false)}>
          Rafraîchir
        </Button>
      </div>
    );
  }

  // COMPLETED — renvoi vers le post-mortem.
  return (
    <Card>
      <CardContent className="space-y-3 py-10 text-center">
        <h2 className="font-display text-xl font-bold">Le verdict est tombé</h2>
        <p className="text-muted-foreground">Découvre ton post-mortem détaillé.</p>
        <Button asChild>
          <Link href={`${routes.pitchSimSession(session.id)}?view=report`}>
            Voir mon post-mortem
            <ArrowRight className="size-5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
