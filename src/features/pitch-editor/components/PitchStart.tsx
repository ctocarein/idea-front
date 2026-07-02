"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ClipboardPaste, Upload, Loader2, ArrowRight, Pencil } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { toast } from "@/shared/ui";
import type { PitchData } from "../actions";
import { generateDeck } from "../actions";

const EDIT_ROUTE = "/dashboard/pitch/edit";

export function PitchStart({ initial }: { initial: PitchData }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [showPaste, setShowPaste] = useState(false);
  const [source, setSource] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const hasDeck = (initial.slides?.length ?? 0) > 0;

  function goEdit() {
    router.push(EDIT_ROUTE);
  }

  function handleGenerate() {
    setBusy("generate");
    start(async () => {
      const res = await generateDeck(initial.id);
      setBusy(null);
      if (!res.ok) { toast.error(res.message); return; }
      goEdit();
    });
  }

  function handlePaste() {
    if (!source.trim()) {
      setShowPaste(true);
      return;
    }
    setBusy("paste");
    start(async () => {
      const res = await generateDeck(initial.id, source.trim());
      setBusy(null);
      if (!res.ok) { toast.error(res.message); return; }
      goEdit();
    });
  }

  async function handleFile(file: File) {
    setBusy("import");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/pitch/${initial.id}/import`, { method: "POST", body: fd });
      if (!res.ok) {
        const msg = res.status === 400 ? "Format non supporté (PDF, PPTX, TXT)." : "Import impossible.";
        toast.error(msg);
        return;
      }
      goEdit();
    } catch {
      toast.error("Import impossible. Réessaie.");
    } finally {
      setBusy(null);
    }
  }

  const disabled = pending || !!busy;

  return (
    <div className="space-y-5">
      {hasDeck && (
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-sm">
            Tu as déjà un deck de <strong>{initial.slides.length} slides</strong>.
          </p>
          <Button size="sm" onClick={goEdit}>
            <Pencil className="mr-1.5 size-3.5" /> Continuer l&apos;édition
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Door
          icon={Sparkles}
          title="Générer"
          desc="À partir de ton diagnostic et de ton travail dans le Workshop."
          loading={busy === "generate"}
          disabled={disabled}
          onClick={handleGenerate}
        />
        <Door
          icon={ClipboardPaste}
          title="Coller un texte"
          desc="Depuis tes notes, un brouillon, une description."
          loading={busy === "paste"}
          disabled={disabled}
          onClick={handlePaste}
        />
        <Door
          icon={Upload}
          title="Importer un fichier"
          desc="PDF, PPTX ou TXT — on en fait un deck propre."
          loading={busy === "import"}
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
        />
      </div>

      {showPaste && (
        <div className="space-y-2">
          <textarea
            autoFocus
            className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm min-h-[120px] scrollbar-soft focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Colle ici ton pitch, ta description, tes notes…"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handlePaste} disabled={disabled || !source.trim()}>
              {busy === "paste" ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <ArrowRight className="mr-1.5 size-4" />}
              Générer depuis ce texte
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.pptx,.txt,.md"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function Door({
  icon: Icon,
  title,
  desc,
  loading,
  disabled,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="text-left disabled:opacity-60">
      <Card className="h-full transition-shadow hover:shadow-sm hover:border-border-strong">
        <CardContent className="pt-6 pb-5 space-y-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {loading ? <Loader2 className="size-5 animate-spin" /> : <Icon className="size-5" />}
          </div>
          <div>
            <h3 className="font-display font-bold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
