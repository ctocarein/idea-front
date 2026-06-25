"use client";

import { useState } from "react";
import { RotateCcw, Send } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button, Textarea } from "@/shared/ui";
import { mockScoreFromInput, type RadarScore } from "@/features/scoring";
import { INVESTOR_INTRO, INVESTOR_QUESTIONS } from "../data/mock";
import { PitchFeedbackPanel } from "./PitchFeedbackPanel";

type Message = { role: "investor" | "user"; text: string };

export function PitchSimulator() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "investor", text: INVESTOR_INTRO },
  ]);
  const [draft, setDraft] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState<RadarScore | null>(null);

  const answers = messages.filter((m) => m.role === "user");

  function send() {
    const text = draft.trim();
    if (!text) return;
    const nextQ = INVESTOR_QUESTIONS[qIndex];
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      nextQ
        ? { role: "investor", text: nextQ }
        : {
            role: "investor",
            text: "Merci. J'ai ce qu'il me faut — terminez quand vous voulez pour voir votre feedback.",
          },
    ]);
    if (nextQ) setQIndex((i) => i + 1);
    setDraft("");
  }

  function finish() {
    const seed = answers.map((a) => a.text).join("|") || "pitch";
    setFeedback(mockScoreFromInput(seed));
  }

  function replay() {
    setMessages([{ role: "investor", text: INVESTOR_INTRO }]);
    setDraft("");
    setQIndex(0);
    setFeedback(null);
  }

  if (feedback) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Ton feedback
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sans jugement. Rejoue autant que tu veux — c&apos;est comme ça qu&apos;on
            perd la peur.
          </p>
        </div>
        <PitchFeedbackPanel score={feedback} />
        <div className="text-center">
          <Button onClick={replay}>
            <RotateCcw className="size-5" />
            Rejouer une session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="max-h-[28rem] space-y-3 overflow-y-auto p-5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              m.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <p
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                m.role === "user"
                  ? "bg-coral-strong text-white"
                  : "bg-secondary text-foreground",
              )}
            >
              {m.text}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-end gap-2 border-t border-border p-3">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Ta réponse à l'investisseur…"
          className="min-h-11 flex-1 resize-none"
        />
        <Button onClick={send} size="icon" aria-label="Envoyer" disabled={!draft.trim()}>
          <Send className="size-5" />
        </Button>
      </div>

      {answers.length > 0 ? (
        <div className="border-t border-border p-3 text-center">
          <Button variant="ghost" size="sm" onClick={finish}>
            Terminer & voir mon feedback
          </Button>
        </div>
      ) : null}
    </div>
  );
}
