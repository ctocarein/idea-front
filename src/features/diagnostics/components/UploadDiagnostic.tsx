"use client";

import { useState } from "react";

import { Button, FileUpload } from "@/shared/ui";
import { mockScoreFromInput, type RadarScore } from "@/features/scoring";

/**
 * Flow B — uploader un projet déjà écrit. L'extraction de texte + le scoring
 * sont mockés (au Sprint INT : upload presigned MinIO → extraction backend →
 * même pipeline que le flow A).
 */
export function UploadDiagnostic({
  isAuthed = false,
  onComplete,
  onAnonSubmit,
}: {
  isAuthed?: boolean;
  onComplete: (score: RadarScore, projectName: string) => void;
  /** Anonyme : on ne révèle pas le bilan → teaser verrouillé (l'upload sera rejoué après inscription). */
  onAnonSubmit?: (projectName: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function analyze() {
    if (!file) return;
    const projectName = file.name.replace(/\.[^.]+$/, "");
    // Anonyme : pas de révélation, on gate → teaser.
    if (!isAuthed) {
      onAnonSubmit?.(projectName);
      return;
    }
    setAnalyzing(true);
    // Connecté (placeholder) : extraction + scoring réels = pipeline backend à brancher.
    window.setTimeout(() => {
      onComplete(mockScoreFromInput(`${projectName}|${file.size}`), projectName);
    }, 900);
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
        {analyzing ? "Analyse en cours…" : "Analyser mon projet"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Formats tolérés. Si l&apos;extraction est imparfaite, tu pourras
        corriger ton bilan ensuite.
      </p>
    </div>
  );
}
