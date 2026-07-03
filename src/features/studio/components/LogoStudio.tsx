"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2, Download, Check, Trash2, Plus } from "lucide-react";

import { Button, toast } from "@/shared/ui";
import type { LogoData, LogoSpec } from "../actions";
import { generateLogo, selectVariation, updateLogo } from "../actions";

// Vocabulaire (miroir de app/studio/vocab.py côté back).
const ICONS = ["spark", "bolt", "leaf", "drop", "heart", "shield", "chat", "rocket", "book", "cart", "globe", "pin", "cube", "graph"];
const GEOMETRICS = ["orbit", "hexagon", "triangle", "diamond", "arc", "waves", "bars", "venn", "chevron", "ring"];
const FONTS = ["poppins", "inter", "montserrat", "space", "sora", "playfair", "fraunces", "dmsans"];
const LAYOUTS = ["icon-left", "icon-top", "mark-only", "wordmark-only"];
const CONTAINERS = ["none", "circle", "rounded", "square"];
const MARK_TYPES: LogoSpec["mark_type"][] = ["geometric", "icon", "monogram"];

function SvgBox({ svg, className = "" }: { svg: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:h-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function LogoStudio({ initial }: { initial: LogoData }) {
  const [logo, setLogo] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();
  const spec = logo.spec;

  function run(fn: () => Promise<{ ok: boolean; logo?: LogoData; message?: string }>) {
    start(async () => {
      const res = await fn();
      if (!res.ok) { toast.error(res.message ?? "Erreur."); return; }
      if (res.logo) setLogo(res.logo);
    });
  }

  function generate() {
    setBusy(true);
    start(async () => {
      const res = await generateLogo(logo.id);
      setBusy(false);
      if (!res.ok) { toast.error(res.message); return; }
      setLogo(res.logo);
    });
  }

  function patch(p: Partial<LogoSpec>) {
    run(() => updateLogo(logo.id, p));
  }

  function downloadSvg() {
    if (!logo.svg) return;
    const blob = new Blob([logo.svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(spec?.name || "logo").toLowerCase().replace(/\s+/g, "-")}.svg`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  // État vide : rien de généré.
  if (!logo.variations.length && !spec) {
    return (
      <div className="rounded-2xl border border-dashed py-16 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-7" />
        </div>
        <h2 className="font-display text-lg font-bold">Crée ton logo</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          L&apos;IA propose 4 concepts à partir de ton projet — marque, couleurs et typo. Tu
          choisis, puis tu ajustes tout.
        </p>
        <Button className="mt-5" onClick={generate} disabled={pending}>
          {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Sparkles className="mr-1.5 size-4" />}
          Générer mes logos
        </Button>
      </div>
    );
  }

  const selectedIdx = logo.variations.findIndex(
    (v) => JSON.stringify(v.spec) === JSON.stringify(spec),
  );

  return (
    <div className="space-y-6">
      {/* Variations proposées */}
      {logo.variations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Concepts proposés</span>
            <button type="button" onClick={generate} disabled={pending}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              {busy ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />} Regénérer
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {logo.variations.map((v, i) => (
              <button key={i} type="button" onClick={() => run(() => selectVariation(logo.id, i))}
                disabled={pending}
                className={`relative h-24 rounded-xl border bg-white p-3 transition-shadow hover:shadow-sm ${
                  i === selectedIdx ? "border-primary ring-2 ring-primary/30" : ""
                }`}>
                {i === selectedIdx && (
                  <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="size-3" />
                  </span>
                )}
                <SvgBox svg={v.svg} className="h-full" />
              </button>
            ))}
          </div>
        </div>
      )}

      {spec && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* Aperçu */}
          <div className="space-y-3">
            <div className="flex min-h-[240px] items-center justify-center rounded-2xl border bg-white p-8">
              {logo.svg && <SvgBox svg={logo.svg} className="max-h-48 w-full" />}
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={downloadSvg}>
                <Download className="mr-1.5 size-3.5" /> Télécharger le SVG
              </Button>
            </div>
          </div>

          {/* Éditeur */}
          <div className="space-y-4 rounded-2xl border bg-card p-5">
            <Text label="Nom" value={spec.name} onCommit={(v) => patch({ name: v })} />

            <WordmarkColor spec={spec} onPatch={patch} />

            <Text label="Slogan (optionnel)" value={spec.tagline ?? ""} onCommit={(v) => patch({ tagline: v })} />
            {(spec.tagline ?? "").trim() && (
              <div className="grid grid-cols-[1fr_auto_auto] items-end gap-2">
                <Select label="Police du slogan" options={["", ...FONTS]} labels={{ "": "Comme le nom" }}
                  value={spec.tagline_font ?? ""} onChange={(v) => patch({ tagline_font: v })} />
                <Seg label="Taille" options={["s", "m", "l"]} value={spec.tagline_size ?? "m"}
                  onChange={(v) => patch({ tagline_size: v as "s" | "m" | "l" })} compact />
                <Color value={spec.tagline_color ?? spec.palette.secondary}
                  onChange={(v) => patch({ tagline_color: v })} title="Couleur" />
              </div>
            )}

            <Seg label="Marque" options={MARK_TYPES} value={spec.mark_type}
              onChange={(v) => patch({ mark_type: v as LogoSpec["mark_type"] })} />

            {spec.mark_type === "icon" && (
              <Select label="Icône" options={ICONS} value={spec.icon ?? "spark"} onChange={(v) => patch({ icon: v })} />
            )}
            {spec.mark_type === "geometric" && (
              <Select label="Forme" options={GEOMETRICS} value={spec.geometric ?? "orbit"} onChange={(v) => patch({ geometric: v })} />
            )}
            {spec.mark_type === "monogram" && (
              <Text label="Initiales (1-2 lettres)" value={spec.monogram ?? ""} onCommit={(v) => patch({ monogram: v })} />
            )}

            <Select label="Disposition" options={LAYOUTS} value={spec.layout} onChange={(v) => patch({ layout: v })} />
            <Select label="Conteneur" options={CONTAINERS} value={spec.container} onChange={(v) => patch({ container: v })} />
            <Select label="Typographie" options={FONTS} value={spec.font} onChange={(v) => patch({ font: v })} />

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Couleurs</label>
              <div className="flex gap-2">
                <Color value={spec.palette.primary} onChange={(v) => patch({ palette: { ...spec.palette, primary: v } })} title="Primaire" />
                <Color value={spec.palette.secondary} onChange={(v) => patch({ palette: { ...spec.palette, secondary: v } })} title="Secondaire" />
                <Color value={spec.palette.accent} onChange={(v) => patch({ palette: { ...spec.palette, accent: v } })} title="Accent" />
                <Color value={spec.palette.bg} onChange={(v) => patch({ palette: { ...spec.palette, bg: v } })} title="Fond" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Text({ label, value, onCommit }: { label: string; value: string; onCommit: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input type="text" defaultValue={value} key={value}
        onBlur={(e) => e.target.value !== value && onCommit(e.target.value)}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}

function Select({ label, options, value, onChange, labels }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; labels?: Record<string, string>;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border bg-background px-2.5 py-2 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-ring">
        {options.map((o) => <option key={o} value={o}>{labels?.[o] ?? o}</option>)}
      </select>
    </div>
  );
}

const SEG_LABEL: Record<string, string> = {
  geometric: "Forme", icon: "Icône", monogram: "Mono", s: "S", m: "M", l: "L",
};

function Seg({ label, options, value, onChange, compact }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; compact?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex gap-1 rounded-lg border p-0.5">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={`rounded-md py-1 text-xs font-medium capitalize transition-colors ${compact ? "px-2.5" : "flex-1 px-2"} ${
              value === o ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            {SEG_LABEL[o] ?? o}
          </button>
        ))}
      </div>
    </div>
  );
}

function seedParts(spec: LogoSpec): { text: string; color: string }[] {
  if (spec.name_parts?.length) return spec.name_parts;
  const name = spec.name || "Marque";
  if (name.length < 2) return [{ text: name, color: spec.name_color ?? spec.palette.primary }];
  const h = Math.ceil(name.length / 2);
  return [
    { text: name.slice(0, h), color: spec.palette.primary },
    { text: name.slice(h), color: spec.palette.accent },
  ];
}

function WordmarkColor({ spec, onPatch }: { spec: LogoSpec; onPatch: (p: Partial<LogoSpec>) => void }) {
  const isMulti = !!spec.name_parts?.length;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">Couleur du nom</label>
        <div className="flex gap-1 rounded-lg border p-0.5">
          {[["uni", "Unie"], ["multi", "Multicolore"]].map(([k, lbl]) => {
            const active = k === "multi" ? isMulti : !isMulti;
            return (
              <button key={k} type="button"
                onClick={() => onPatch(k === "multi" ? { name_parts: seedParts(spec) } : { name_parts: [] })}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}>
                {lbl}
              </button>
            );
          })}
        </div>
      </div>
      {isMulti ? (
        <SegmentsEditor parts={spec.name_parts!} onChange={(p) => onPatch({ name_parts: p })} />
      ) : (
        <Color value={spec.name_color ?? spec.palette.primary} onChange={(v) => onPatch({ name_color: v })} title="Nom" />
      )}
    </div>
  );
}

function SegmentsEditor({ parts, onChange }: {
  parts: { text: string; color: string }[]; onChange: (p: { text: string; color: string }[]) => void;
}) {
  const set = (i: number, p: Partial<{ text: string; color: string }>) =>
    onChange(parts.map((seg, j) => (j === i ? { ...seg, ...p } : seg)));
  return (
    <div className="space-y-1.5">
      {parts.map((seg, i) => (
        <div key={`${i}-${seg.text}`} className="flex items-center gap-2">
          <input type="text" defaultValue={seg.text}
            onBlur={(e) => e.target.value !== seg.text && set(i, { text: e.target.value })}
            className="min-w-0 flex-1 rounded-lg border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <input type="color" value={seg.color} onChange={(e) => set(i, { color: e.target.value })}
            className="h-8 w-9 shrink-0 cursor-pointer rounded border bg-transparent" />
          <button type="button" onClick={() => onChange(parts.filter((_, j) => j !== i))}
            disabled={parts.length <= 1}
            className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-30">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...parts, { text: "", color: "#111827" }])}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
        <Plus className="size-3" /> Ajouter un segment
      </button>
    </div>
  );
}

function Color({ value, onChange, title }: { value: string; onChange: (v: string) => void; title: string }) {
  return (
    <label className="flex-1 cursor-pointer" title={title}>
      <span className="mb-1 block text-[10px] text-muted-foreground">{title}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full cursor-pointer rounded border bg-transparent" />
    </label>
  );
}
