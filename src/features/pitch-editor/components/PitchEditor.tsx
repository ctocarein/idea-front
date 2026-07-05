"use client";

import { useState, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Check, Loader2, Download } from "lucide-react";
import { Button, Card, CardContent, toast } from "@/shared/ui";
import type { PitchData, PitchSection } from "../actions";
import { updateSection, generateSection } from "../actions";

export function PitchEditor({ initial }: { initial: PitchData }) {
  const t = useTranslations("Pitch.editor");
  const [sections, setSections] = useState<PitchSection[]>(initial.sections);
  const [exporting, setExporting] = useState<string | null>(null);
  const filled = sections.filter((s) => s.content.trim().length > 0).length;

  function setContent(key: string, content: string) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, content } : s)));
  }

  async function handleExport(format: "pdf" | "pptx") {
    setExporting(format);
    try {
      const res = await fetch(`/api/pitch/${initial.id}/export?format=${format}`);
      if (!res.ok) {
        toast.error(
          res.status === 503
            ? t("exportUnavailable", { format: format.toUpperCase() })
            : t("exportFailed"),
        );
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pitch.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("exportFailed"));
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {t.rich("sections", {
              filled,
              total: sections.length,
              b: (c) => <span className="font-semibold text-foreground">{c}</span>,
            })}
          </p>
          <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(filled / sections.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleExport("pptx")} disabled={!!exporting}>
            {exporting === "pptx" ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            <span className="ml-1.5">PPTX</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleExport("pdf")} disabled={!!exporting}>
            {exporting === "pdf" ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            <span className="ml-1.5">PDF</span>
          </Button>
        </div>
      </div>

      {sections.map((section, i) => (
        <SectionCard
          key={section.key}
          index={i + 1}
          pitchId={initial.id}
          section={section}
          onChange={(content) => setContent(section.key, content)}
        />
      ))}
    </div>
  );
}

function SectionCard({
  index,
  pitchId,
  section,
  onChange,
}: {
  index: number;
  pitchId: string;
  section: PitchSection;
  onChange: (content: string) => void;
}) {
  const t = useTranslations("Pitch.editor");
  const [saving, startSave] = useTransition();
  const [generating, startGen] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const lastSaved = useRef(section.content);

  function persist(content: string) {
    if (content === lastSaved.current) return;
    startSave(async () => {
      const res = await updateSection(pitchId, section.key, content);
      if (res.ok) {
        lastSaved.current = content;
        setSavedAt(Date.now());
      } else {
        toast.error(res.message);
      }
    });
  }

  function handleGenerate() {
    startGen(async () => {
      const res = await generateSection(pitchId, section.key);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      onChange(res.content);
      persist(res.content);
      toast.success(t("toastWritten"));
    });
  }

  const hasContent = section.content.trim().length > 0;

  return (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                {index}
              </span>
              <h3 className="font-display font-bold text-base">{section.title}</h3>
              {savedAt && !saving && (
                <span className="inline-flex items-center gap-1 text-xs text-success">
                  <Check className="size-3" /> {t("saved")}
                </span>
              )}
              {saving && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{section.hint}</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generating} className="shrink-0">
            {generating ? (
              <><Loader2 className="mr-1.5 size-3.5 animate-spin" /> {t("writing")}</>
            ) : (
              <><Sparkles className="mr-1.5 size-3.5" /> {hasContent ? t("improve") : t("write")}</>
            )}
          </Button>
        </div>

        <textarea
          className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring min-h-[96px] scrollbar-soft"
          placeholder={t("placeholder")}
          value={section.content}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => persist(e.target.value)}
          disabled={generating}
        />
      </CardContent>
    </Card>
  );
}
