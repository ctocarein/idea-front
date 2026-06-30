"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, ChevronRight, Loader2, RefreshCw, CheckCircle2, Bot } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent } from "@/shared/ui/Card";
import { toast } from "@/shared/ui";
import type { ModuleSessionData } from "../actions";
import {
  sendModuleTurn,
  prefillModuleForm,
  saveModuleForm,
  generateFiches,
} from "../actions";
import { NeedFicheCard } from "./NeedFicheCard";

interface Props {
  initial: ModuleSessionData;
}

const PHASE_LABELS: Record<string, { label: string; step: number }> = {
  context: { label: "Questions de contexte", step: 1 },
  form: { label: "Formulaire", step: 2 },
  fiches: { label: "Fiches de besoin", step: 3 },
};

function TypingBubble() {
  return (
    <div className="flex justify-start items-end gap-2">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Bot className="size-3.5 text-primary" />
      </div>
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
          <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
          <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

const MARKDOWN_COMPONENTS = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-1.5 first:mt-0 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-1.5 space-y-1.5 list-none">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-1.5 space-y-1.5 list-decimal pl-5">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed marker:text-primary">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="text-muted-foreground not-italic block mt-0.5 text-[13px]">{children}</em>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-background/60 px-1 py-0.5 text-[13px] font-mono">{children}</code>
  ),
};

function CoachMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-start items-end gap-2">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mb-0.5">
        <Bot className="size-3.5 text-primary" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm text-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function PorteurMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}

export function ModuleFlow({ initial }: Props) {
  const [session, setSession] = useState(initial);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>(
    (initial.form_data as Record<string, string>) ?? {}
  );
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.turns, isPending]);

  function handleSend() {
    if (!message.trim() || isPending) return;
    const msg = message;
    setMessage("");
    textareaRef.current?.focus();
    startTransition(async () => {
      const result = await sendModuleTurn(session.id, msg);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setSession(result.session);
    });
  }

  function handlePrefillForm() {
    startTransition(async () => {
      const result = await prefillModuleForm(session.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setSession(result.session);
      setFormData((result.session.form_data as Record<string, string>) ?? {});
    });
  }

  function handleSaveForm() {
    startTransition(async () => {
      const result = await saveModuleForm(session.id, formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setSession(result.session);
    });
  }

  function handleGenerateFiches() {
    startTransition(async () => {
      const result = await generateFiches(session.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setSession(result.session);
    });
  }

  const currentPhase = PHASE_LABELS[session.phase] ?? { label: session.phase, step: 1 };
  const canPassToForm = session.turns.filter(t => t.role === "porteur").length >= 2;

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {Object.entries(PHASE_LABELS).map(([key, { label, step }], idx, arr) => {
          const isDone = currentPhase.step > step;
          const isCurrent = session.phase === key;
          return (
            <div key={key} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isDone
                      ? "bg-success text-white"
                      : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="size-3.5" /> : step}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <ChevronRight className="size-4 text-muted-foreground/50 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Phase context */}
      {session.phase === "context" && (
        <div className="space-y-4">
          {/* Fenêtre de chat */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scroll-smooth">
            {session.turns.map((turn, i) =>
              turn.role === "porteur" ? (
                <PorteurMessage key={i} text={turn.text} />
              ) : (
                <CoachMessage key={i} text={turn.text} />
              )
            )}

            {isPending && <TypingBubble />}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring transition-shadow">
            <textarea
              ref={textareaRef}
              className="w-full resize-none rounded-t-xl bg-transparent px-4 pt-3 pb-2 text-sm focus:outline-none min-h-[72px] max-h-[160px]"
              placeholder="Réponds aux questions du coach…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
              }}
              disabled={isPending}
            />
            <div className="flex items-center justify-between px-3 pb-2">
              <span className="text-xs text-muted-foreground">⌘ + Entrée pour envoyer</span>
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!message.trim() || isPending}
              >
                <Send className="size-3.5 mr-1.5" />
                Envoyer
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {!canPassToForm ? (
              <p className="text-xs text-muted-foreground">
                Réponds à au moins 2 questions du coach avant de continuer.
              </p>
            ) : (
              <span />
            )}
            <Button
              variant="outline"
              onClick={handlePrefillForm}
              disabled={isPending || !canPassToForm}
            >
              {isPending ? (
                <><Loader2 className="mr-2 size-4 animate-spin" /> Génération du formulaire…</>
              ) : (
                <>Passer au formulaire <ChevronRight className="ml-1.5 size-4" /></>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Phase form */}
      {session.phase === "form" && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Ce formulaire a été pré-rempli par l&apos;IA à partir de ta conversation. Complète ou corrige chaque section.
          </p>

          <div className="space-y-4">
            {session.form_sections.map((section) => (
              <div key={section.key}>
                <label className="block text-sm font-semibold mb-1.5">
                  {section.label}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">— {section.hint}</span>
                </label>
                <textarea
                  className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
                  placeholder={section.hint}
                  value={formData[section.key] ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [section.key]: e.target.value }))
                  }
                  disabled={isPending}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center pt-2">
            <Button variant="ghost" size="sm" onClick={handlePrefillForm} disabled={isPending}>
              <RefreshCw className="mr-1.5 size-3.5" />
              Regénérer depuis la conversation
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSaveForm} disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : "Enregistrer"}
              </Button>
              <Button onClick={handleGenerateFiches} disabled={isPending}>
                {isPending ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" /> Génération…</>
                ) : (
                  <>Générer mes fiches <ChevronRight className="ml-1.5 size-4" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Phase fiches */}
      {session.phase === "fiches" && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-success/5 border-success/20 px-4 py-3">
            <p className="text-sm font-medium text-success">
              {session.fiches.length} fiche{session.fiches.length > 1 ? "s" : ""} de besoin générée{session.fiches.length > 1 ? "s" : ""}.
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Confirme les besoins qui correspondent à ta réalité.
            </p>
          </div>

          {session.fiches.map((fiche) => (
            <NeedFicheCard key={fiche.id} fiche={fiche} />
          ))}

          {session.fiches.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Aucune fiche n&apos;a pu être générée. Complète le formulaire puis réessaie.
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => setSession((s) => ({ ...s, phase: "form" }))}
                >
                  Retour au formulaire
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
