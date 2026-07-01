"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { toast } from "@/shared/ui";
import type { PitchData } from "../actions";
import { generateDeck, setTemplate } from "../actions";

const TEMPLATES = [
  { id: "base", label: "Base" },
  { id: "midnight", label: "Midnight" },
  { id: "editorial", label: "Éditorial" },
];

export function DeckPanel({ initial }: { initial: PitchData }) {
  const [templateId, setTemplateId] = useState(initial.template_id || "base");
  const [slideCount, setSlideCount] = useState(initial.slides?.length ?? 0);
  const [rev, setRev] = useState(0); // cache-bust de l'iframe
  const [showSource, setShowSource] = useState(false);
  const [source, setSource] = useState("");
  const [pending, start] = useTransition();

  function refresh() {
    setRev((r) => r + 1);
  }

  function handleGenerate() {
    start(async () => {
      const res = await generateDeck(initial.id, source.trim() || undefined);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      setSlideCount(res.pitch.slides?.length ?? 0);
      setTemplateId(res.pitch.template_id || templateId);
      refresh();
      toast.success(`Deck généré — ${res.pitch.slides?.length ?? 0} slides.`);
    });
  }

  function handleTemplate(id: string) {
    if (id === templateId) return;
    setTemplateId(id);
    start(async () => {
      const res = await setTemplate(initial.id, id);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      refresh();
    });
  }

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTemplate(t.id)}
              disabled={pending}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                templateId === t.id
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:border-border-strong"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={handleGenerate} disabled={pending}>
          {pending ? (
            <><Loader2 className="mr-1.5 size-4 animate-spin" /> Génération…</>
          ) : (
            <><Sparkles className="mr-1.5 size-4" /> {slideCount > 0 ? "Regénérer le deck" : "Générer mon deck"}</>
          )}
        </Button>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowSource((v) => !v)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className={`size-3.5 transition-transform ${showSource ? "rotate-180" : ""}`} />
          Partir d&apos;un texte (coller / importer) plutôt que de mes sections
        </button>
        {showSource && (
          <textarea
            className="mt-2 w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm min-h-[90px] scrollbar-soft focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Colle ici ton pitch, ta description, ou tes notes — l'IA en fera un deck…"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        )}
      </div>

      {slideCount > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-[#E9E7F0]">
          <iframe
            key={rev}
            src={`/api/pitch/${initial.id}/deck?rev=${rev}`}
            title="Aperçu du deck"
            className="w-full"
            style={{ height: 460, border: 0 }}
          />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Génère ton deck : l&apos;IA transforme ton travail en slides visuelles (chiffres, graphiques, images).
        </p>
      )}
    </div>
  );
}
