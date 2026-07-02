"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronUp, ChevronDown, Trash2, Download, Play, Loader2, Sparkles,
} from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { toast } from "@/shared/ui";
import type { PitchData } from "../actions";
import { updateSlide, deleteSlide, reorderSlides, setTemplate, generateDeck } from "../actions";

type Slide = Record<string, unknown>;

const TEMPLATES = [
  { id: "base", label: "Base" },
  { id: "midnight", label: "Midnight" },
  { id: "editorial", label: "Éditorial" },
];
const LAYOUTS = ["cover", "stat", "bullets", "chart", "image"];

export function DeckEditor({ initial }: { initial: PitchData }) {
  const [pitch, setPitch] = useState(initial);
  const [sel, setSel] = useState(0);
  const [rev, setRev] = useState(0);
  const [exporting, setExporting] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const slides = pitch.slides as Slide[];

  function apply(p: PitchData) {
    setPitch(p);
    setRev((r) => r + 1);
  }

  function saveField(index: number, fields: Record<string, unknown>) {
    start(async () => {
      const res = await updateSlide(pitch.id, index, fields);
      if (!res.ok) { toast.error(res.message); return; }
      apply(res.pitch);
    });
  }

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= slides.length) return;
    const order = slides.map((_, i) => i);
    [order[index], order[j]] = [order[j], order[index]];
    start(async () => {
      const res = await reorderSlides(pitch.id, order);
      if (!res.ok) { toast.error(res.message); return; }
      apply(res.pitch);
      setSel(j);
    });
  }

  function remove(index: number) {
    start(async () => {
      const res = await deleteSlide(pitch.id, index);
      if (!res.ok) { toast.error(res.message); return; }
      apply(res.pitch);
      setSel((s) => Math.max(0, Math.min(s, res.pitch.slides.length - 1)));
    });
  }

  function chooseTemplate(id: string) {
    if (id === pitch.template_id) return;
    start(async () => {
      const res = await setTemplate(pitch.id, id);
      if (!res.ok) { toast.error(res.message); return; }
      apply(res.pitch);
    });
  }

  function regenerate() {
    start(async () => {
      const res = await generateDeck(pitch.id);
      if (!res.ok) { toast.error(res.message); return; }
      apply(res.pitch);
      toast.success(`Deck regénéré — ${res.pitch.slides.length} slides.`);
    });
  }

  async function exportAs(format: "pdf" | "pptx") {
    setExporting(format);
    try {
      const res = await fetch(`/api/pitch/${pitch.id}/export?format=${format}`);
      if (!res.ok) {
        toast.error(res.status === 503 ? `Export ${format.toUpperCase()} indisponible ici.` : "Export impossible.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `deck.${format}`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }

  const current = slides[sel];

  return (
    <div className="space-y-4">
      {/* Barre du haut */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/pitch" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Démarrer
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {TEMPLATES.map((t) => (
            <button key={t.id} type="button" onClick={() => chooseTemplate(t.id)} disabled={pending}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                pitch.template_id === t.id ? "border-primary/40 bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>
              {t.label}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-border" />
          <a href={`/api/pitch/${pitch.id}/deck?rev=${rev}`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline"><Play className="mr-1.5 size-3.5" /> Présenter</Button>
          </a>
          <Button size="sm" variant="outline" onClick={() => exportAs("pptx")} disabled={!!exporting}>
            {exporting === "pptx" ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}<span className="ml-1.5">PPTX</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportAs("pdf")} disabled={!!exporting}>
            {exporting === "pdf" ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}<span className="ml-1.5">PDF</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        {/* Liste des slides */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{slides.length} slides</span>
            <button type="button" onClick={regenerate} disabled={pending} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Sparkles className="size-3" /> Regénérer
            </button>
          </div>
          {slides.map((s, i) => (
            <div key={i} className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-sm ${i === sel ? "border-primary/40 bg-primary/5" : ""}`}>
              <button type="button" onClick={() => setSel(i)} className="flex-1 truncate text-left">
                <span className="text-muted-foreground mr-1.5">{i + 1}</span>
                {String(s.title || s.layout || "slide")}
              </button>
              <button type="button" onClick={() => move(i, -1)} disabled={pending || i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronUp className="size-3.5" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={pending || i === slides.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronDown className="size-3.5" /></button>
              <button type="button" onClick={() => remove(i)} disabled={pending || slides.length <= 1} className="text-muted-foreground hover:text-destructive disabled:opacity-30"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
        </div>

        {/* Édition de la slide sélectionnée */}
        {current && <SlideForm key={sel} index={sel} slide={current} onSave={saveField} />}
      </div>

      {/* Aperçu du deck */}
      <div className="overflow-hidden rounded-xl border bg-[#E9E7F0]">
        <iframe key={rev} src={`/api/pitch/${pitch.id}/deck?rev=${rev}`} title="Aperçu du deck" className="w-full" style={{ height: 420, border: 0 }} />
      </div>
    </div>
  );
}

function SlideForm({
  index, slide, onSave,
}: {
  index: number;
  slide: Slide;
  onSave: (index: number, fields: Record<string, unknown>) => void;
}) {
  const layout = String(slide.layout || "bullets");
  const stat = (slide.stat as Record<string, unknown>) || {};
  const chart = (slide.chart as Record<string, unknown>) || {};

  function field(name: string, value: unknown) {
    onSave(index, { [name]: value });
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground">Layout</label>
        <select
          defaultValue={layout}
          onChange={(e) => field("layout", e.target.value)}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        >
          {LAYOUTS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <Field label="Titre" defaultValue={String(slide.title || "")} onBlur={(v) => field("title", v)} />
      <Field label="Sous-titre / légende" defaultValue={String(slide.subtitle || slide.caption || "")} onBlur={(v) => field("subtitle", v)} />

      {(layout === "bullets") && (
        <TextareaField label="Bullets (une par ligne, 3 max)" defaultValue={(slide.bullets as string[] || []).join("\n")}
          onBlur={(v) => field("bullets", v.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 3))} />
      )}

      {layout === "stat" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Chiffre" defaultValue={String(stat.value || "")} onBlur={(v) => field("stat", { ...stat, value: v })} />
          <Field label="Label" defaultValue={String(stat.label || "")} onBlur={(v) => field("stat", { ...stat, label: v })} />
        </div>
      )}

      {layout === "chart" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <select defaultValue={String(chart.type || "bar")} onChange={(e) => field("chart", { ...chart, type: e.target.value })}
              className="rounded-md border bg-background px-2 py-1 text-sm">
              {["bar", "line", "pie"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Field label="Labels (séparés par des virgules)" defaultValue={(chart.labels as string[] || []).join(", ")}
            onBlur={(v) => field("chart", { ...chart, labels: v.split(",").map((x) => x.trim()).filter(Boolean) })} />
          <Field label="Valeurs (séparées par des virgules)" defaultValue={(chart.values as number[] || []).join(", ")}
            onBlur={(v) => field("chart", { ...chart, values: v.split(",").map((x) => Number(x.trim())).filter((n) => !isNaN(n)) })} />
        </div>
      )}

      {layout !== "stat" && layout !== "chart" && (
        <Field label="Mot-clé image (anglais)" defaultValue={String(slide.image_keyword || "")} onBlur={(v) => field("image_keyword", v)} />
      )}
    </div>
  );
}

function Field({ label, defaultValue, onBlur }: { label: string; defaultValue: string; onBlur: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input type="text" defaultValue={defaultValue} onBlur={(e) => e.target.value !== defaultValue && onBlur(e.target.value)}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}

function TextareaField({ label, defaultValue, onBlur }: { label: string; defaultValue: string; onBlur: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <textarea defaultValue={defaultValue} onBlur={(e) => e.target.value !== defaultValue && onBlur(e.target.value)}
        className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px] scrollbar-soft focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
