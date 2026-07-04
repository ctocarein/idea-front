"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, ChevronRight, Loader2, RefreshCw, CheckCircle2, Bot, Sparkles, Gauge, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { Button, Card, CardContent, toast } from "@/shared/ui";
import type { ModuleSessionData } from "../actions";
import {
  sendModuleTurn,
  prefillModuleForm,
  saveModuleForm,
  generateFiches,
  rescoreAxis,
} from "../actions";
import { NeedFicheCard } from "./NeedFicheCard";

interface Props {
  initial: ModuleSessionData;
}

/** Étapes du module (le libellé vient du namespace Workshop.module.steps). */
const PHASE_STEPS: Record<string, number> = { context: 1, form: 2, fiches: 3 };

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
    <em className="text-muted-foreground italic block mt-0.5 text-[11pt] leading-snug">{children}</em>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-background/60 px-1 py-0.5 text-[11pt] font-mono">{children}</code>
  ),
};

function CoachMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-start items-end gap-2">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mb-0.5">
        <Bot className="size-3.5 text-primary" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-[12pt] leading-relaxed text-foreground">
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
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-[12pt] leading-relaxed text-primary-foreground whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}

function ProgressPanel({
  before,
  after,
  isPending,
  onRescore,
}: {
  before: number | null;
  after: number | null;
  isPending: boolean;
  onRescore: () => void;
}) {
  const t = useTranslations("Workshop.module.progress");
  // Pas encore mesuré → invitation à mesurer la progression sur l'axe.
  if (after === null) {
    return (
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <Gauge className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">{t("measureTitle")}</p>
              <p className="text-xs text-muted-foreground">
                {t("measureText")}
              </p>
            </div>
          </div>
          <Button onClick={onRescore} disabled={isPending} className="shrink-0">
            {isPending ? (
              <><Loader2 className="mr-2 size-4 animate-spin" /> {t("measuring")}</>
            ) : (
              <><Gauge className="mr-1.5 size-4" /> {t("measureCta")}</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Mesuré → avant / après avec delta.
  const delta = before !== null ? after - before : null;
  const improved = delta !== null && delta > 0;
  return (
    <Card className={improved ? "border-success/40 bg-success/5" : "border-border"}>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className={`size-4 ${improved ? "text-success" : "text-muted-foreground"}`} />
          <p className="text-sm font-semibold">
            {improved ? t("improved") : t("remeasured")}
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          {before !== null && (
            <>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-0.5">{t("before")}</p>
                <p className="font-display text-2xl font-bold tabular-nums text-muted-foreground">{before}<span className="text-sm font-normal">/10</span></p>
              </div>
              <ArrowRight className="size-5 text-muted-foreground/50" />
            </>
          )}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-0.5">{t("after")}</p>
            <p className={`font-display text-3xl font-extrabold tabular-nums ${improved ? "text-success" : "text-foreground"}`}>
              {after}<span className="text-base font-normal">/10</span>
            </p>
          </div>
          {improved && (
            <span className="ml-1 rounded-full bg-success/15 px-2.5 py-1 text-sm font-bold text-success">
              +{delta}
            </span>
          )}
        </div>
        <div className="mt-4 flex justify-center">
          <Button variant="ghost" size="sm" onClick={onRescore} disabled={isPending}>
            <RefreshCw className="mr-1.5 size-3.5" />
            {isPending ? t("measuring") : t("remeasure")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ModuleFlow({ initial }: Props) {
  const t = useTranslations("Workshop.module");
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

  function resetTextareaHeight() {
    const el = textareaRef.current;
    if (el) el.style.height = "auto";
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  function handleSend() {
    if (!message.trim() || isPending) return;
    const msg = message;
    setMessage("");
    resetTextareaHeight();
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

  function handleRescore() {
    startTransition(async () => {
      const result = await rescoreAxis(session.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setSession(result.session);
      const before = result.session.axis_score_before;
      const after = result.session.axis_score_after;
      if (after !== null && before !== null && after > before) {
        toast.success(t("progress.toastProgress", { before, after }));
      }
    });
  }

  const currentStep = PHASE_STEPS[session.phase] ?? 1;
  const canPassToForm = session.turns.filter((turn) => turn.role === "porteur").length >= 1;

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {Object.entries(PHASE_STEPS).map(([key, step], idx, arr) => {
          const isDone = currentStep > step;
          const isCurrent = session.phase === key;
          return (
            <div key={key} className="flex items-center gap-1.5 sm:gap-2">
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
                {/* Label : toujours visible pour l'étape courante, dès sm pour les autres */}
                <span
                  className={`text-sm font-medium ${isCurrent ? "inline" : "hidden sm:inline"} ${
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t(`steps.${key}`)}
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
          <div className="space-y-3 max-h-[520px] overflow-y-auto scrollbar-soft pr-2 scroll-smooth">
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

          {/* Invitation intelligente : le coach a réuni assez d'éléments */}
          {session.context_ready && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className="flex items-start gap-2.5">
                <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{t("coachEnoughTitle")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("coachEnoughText")}
                  </p>
                </div>
              </div>
              <Button onClick={handlePrefillForm} disabled={isPending} className="shrink-0">
                {isPending ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" /> {t("structuring")}</>
                ) : (
                  <>{t("structure")} <ChevronRight className="ml-1.5 size-4" /></>
                )}
              </Button>
            </div>
          )}

          {/* Zone de saisie */}
          <div className="rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring transition-shadow">
            <textarea
              ref={textareaRef}
              rows={1}
              className="w-full resize-none rounded-t-xl bg-transparent px-4 pt-3 pb-2 text-sm leading-relaxed focus:outline-none min-h-[48px] max-h-[200px] scrollbar-soft"
              placeholder={t("inputPlaceholder")}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isPending}
            />
            <div className="flex items-center justify-between px-3 pb-2 gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {t.rich("kbdHint", { k: (chunks) => <kbd className="font-sans">{chunks}</kbd> })}
              </span>
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!message.trim() || isPending}
                className="ml-auto"
              >
                <Send className="size-3.5 mr-1.5" />
                {t("send")}
              </Button>
            </div>
          </div>

          {/* Échappatoire discrète : passer à la synthèse sans attendre le signal */}
          {!session.context_ready && canPassToForm && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={handlePrefillForm}
                disabled={isPending}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline disabled:opacity-50"
              >
                {isPending ? t("structuring") : t("structureNow")}
              </button>
            </div>
          )}
          {!canPassToForm && (
            <p className="text-center text-xs text-muted-foreground pt-1">
              {t("atLeastOne")}
            </p>
          )}
        </div>
      )}

      {/* Phase form */}
      {session.phase === "form" && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            {t.rich("formIntro", {
              b: (chunks) => <strong className="text-foreground font-semibold">{chunks}</strong>,
            })}
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
              {t("regenerate")}
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSaveForm} disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : t("save")}
              </Button>
              <Button onClick={handleGenerateFiches} disabled={isPending}>
                {isPending ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" /> {t("generating")}</>
                ) : (
                  <>{t("generateFiches")} <ChevronRight className="ml-1.5 size-4" /></>
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
              {t("fichesGenerated", { count: session.fiches.length })}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t.rich("fichesConfirmHint", {
                link: (chunks) => (
                  <Link href={routes.besoins} className="font-medium text-primary underline-offset-4 hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>

          {/* Mesure de progression sur l'axe (boucle B) */}
          <ProgressPanel
            before={session.axis_score_before}
            after={session.axis_score_after}
            isPending={isPending}
            onRescore={handleRescore}
          />

          {session.fiches.map((fiche) => (
            <NeedFicheCard key={fiche.id} fiche={fiche} />
          ))}

          {session.fiches.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  {t("noFiches")}
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => setSession((s) => ({ ...s, phase: "form" }))}
                >
                  {t("backToForm")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
