"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button, Textarea } from "@/shared/ui";

/**
 * Construire guidé (BESOINS_PORTEUR cas 2, point de vigilance 1) :
 * le porteur ÉCRIT, l'IA explique et questionne. Jamais de production
 * « clé en main » — c'est la frontière gratuit / Phase Pro.
 *
 * Réponses mockées (design-first). Au Sprint INT : `app/llm` (modèle bon
 * marché), sessions sauvegardées en brouillon.
 */
type Message = { role: "assistant" | "user"; text: string };

const COACH: string[] = [
  "Bien. À qui, précisément, s'adresse ce besoin ? Donne un exemple concret de personne.",
  "Qu'est-ce qui prouve que ce problème vaut la peine d'être résolu ? Un fait, pas une intuition.",
  "Reformule en une phrase qu'un inconnu comprendrait. C'est toi qui écris — je t'aide à l'affiner.",
  "Et si on te disait que ça existe déjà ? Qu'as-tu que les autres n'ont pas ?",
  "Bon travail. Relis ta dernière phrase à voix haute : sonne-t-elle vraie ?",
];

const INTRO: Message = {
  role: "assistant",
  text: "On construit ta version ensemble. Écris une première phrase sur ton projet — je ne le fais pas à ta place, je t'aide à le rendre plus clair.",
};

export function GuidedBuilder() {
  const [messages, setMessages] = useState<Message[]>([INTRO]);
  const [draft, setDraft] = useState("");

  function send() {
    const text = draft.trim();
    if (!text) return;
    const turn = messages.filter((m) => m.role === "user").length;
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "assistant", text: COACH[turn % COACH.length] },
    ]);
    setDraft("");
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <Sparkles className="size-5 text-coral-strong" />
        <h3 className="font-display text-base font-bold">
          Construire ma version, guidé
        </h3>
      </div>

      <div className="max-h-80 space-y-3 overflow-y-auto p-5">
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
          placeholder="Écris ta phrase…"
          className="min-h-11 flex-1 resize-none"
        />
        <Button onClick={send} size="icon" aria-label="Envoyer" disabled={!draft.trim()}>
          <Send className="size-5" />
        </Button>
      </div>
    </div>
  );
}
