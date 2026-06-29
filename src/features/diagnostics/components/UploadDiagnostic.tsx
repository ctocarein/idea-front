"use client";

import { useRef, useState, useTransition } from "react";
import { UploadCloud } from "lucide-react";

import { Button, FileUpload, toast } from "@/shared/ui";
import { type IdeaExtract, extractFileIdea } from "../api/actions";

/**
 * Flow B — upload PDF/DOCX → extraction de texte côté backend → même pipeline « Raconte ».
 * Le résultat (`IdeaExtract` + `description`) est remonté via `onExtracted` pour que
 * `DiagnosticEntry` bascule vers `RaconteDiagnostic` en mode organize (le "tell" est skippé).
 *
 * Anonyme : on ne fait pas l'extraction LLM (coûteuse) → stash du nom de fichier + teaser.
 */
export function UploadDiagnostic({
  isAuthed = false,
  onExtracted,
  onAnonSubmit,
}: {
  isAuthed?: boolean;
  /** Extraction réussie → DiagnosticEntry affiche RaconteDiagnostic en mode organize. */
  onExtracted: (extract: IdeaExtract, description: string) => void;
  onAnonSubmit?: (projectName: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, startTransition] = useTransition();

  function analyze() {
    if (!file) return;

    const projectName = file.name.replace(/\.[^.]+$/, "");

    if (!isAuthed) {
      onAnonSubmit?.(projectName);
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("project_name", projectName);

    startTransition(async () => {
      const res = await extractFileIdea(form);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      onExtracted(res.data, res.description);
    });
  }

  return (
    <div className="space-y-5">
      <FileUpload
        accept=".pdf,.docx"
        onFileChange={setFile}
        hint="PDF ou DOCX, 20 Mo max — on en extrait ton projet."
      />
      <Button
        onClick={analyze}
        disabled={!file}
        loading={analyzing}
        className="w-full"
      >
        {analyzing ? "Extraction en cours…" : "Analyser mon projet"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Le texte de ton document sera analysé par le LLM — même pipeline que &quot;Raconte ton idée&quot;.
      </p>
    </div>
  );
}
