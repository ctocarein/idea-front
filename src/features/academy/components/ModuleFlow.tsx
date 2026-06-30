"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Send, ChevronRight, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
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

export function ModuleFlow({ initial }: Props) {
  const [session, setSession] = useState(initial);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>(
    (initial.form_data as Record<string, string>) ?? {}
  );
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.turns]);

  function handleSend() {
    if (!message.trim() || isPending) return;
    const msg = message;
    setMessage("");
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
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
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
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {session.turns.map((turn, i) => (
              <div
                key={i}
                className={`flex ${turn.role === "porteur" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    turn.role === "porteur"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {turn.text}
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <textarea
              className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
              placeholder="Réponds aux questions du coach…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
              }}
              disabled={isPending}
            />
            <div className="flex flex-col gap-2">
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!message.trim() || isPending}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={handlePrefillForm}
              disabled={isPending || session.turns.length < 3}
            >
              {isPending ? (
                <><Loader2 className="mr-2 size-4 animate-spin" /> Génération du formulaire…</>
              ) : (
                <>Passer au formulaire <ChevronRight className="ml-1.5 size-4" /></>
              )}
            </Button>
          </div>
          {session.turns.length < 3 && (
            <p className="text-center text-xs text-muted-foreground">
              Réponds aux questions du coach avant de passer au formulaire.
            </p>
          )}
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
                  <>Générer mes fiches de besoin <ChevronRight className="ml-1.5 size-4" /></>
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
