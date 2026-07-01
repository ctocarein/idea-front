"use client";

import { useState, useRef, useTransition } from "react";
import { Sparkles, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { toast } from "@/shared/ui";
import type { PitchData, PitchSection } from "../actions";
import { updateSection, generateSection } from "../actions";

export function PitchEditor({ initial }: { initial: PitchData }) {
  const [sections, setSections] = useState<PitchSection[]>(initial.sections);
  const filled = sections.filter((s) => s.content.trim().length > 0).length;

  function setContent(key: string, content: string) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, content } : s)));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{filled}</span> / {sections.length} sections rédigées
        </p>
        <div className="h-1.5 w-28 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(filled / sections.length) * 100}%` }}
          />
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
      toast.success("Section rédigée par l'IA.");
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
                  <Check className="size-3" /> Enregistré
                </span>
              )}
              {saving && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{section.hint}</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generating} className="shrink-0">
            {generating ? (
              <><Loader2 className="mr-1.5 size-3.5 animate-spin" /> Rédaction…</>
            ) : (
              <><Sparkles className="mr-1.5 size-3.5" /> {hasContent ? "Améliorer" : "Rédiger"}</>
            )}
          </Button>
        </div>

        <textarea
          className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring min-h-[96px] scrollbar-soft"
          placeholder="Rédige cette section, ou laisse l'IA la proposer à partir de ton travail dans le Workshop…"
          value={section.content}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => persist(e.target.value)}
          disabled={generating}
        />
      </CardContent>
    </Card>
  );
}
