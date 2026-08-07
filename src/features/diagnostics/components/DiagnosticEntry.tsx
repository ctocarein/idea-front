"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, PenLine, UploadCloud } from "lucide-react";

import { Button, Card } from "@/shared/ui";
import type { IdeaExtract } from "../api/actions";
import { RaconteDiagnostic } from "./RaconteDiagnostic";
import { UploadDiagnostic } from "./UploadDiagnostic";
import { DiagnosticTeaser } from "./DiagnosticTeaser";

type Mode = "manual" | "upload";

/** État intermédiaire : l'extraction de fichier a réussi, on enchaîne sur organize. */
type Extracted = { extract: IdeaExtract; description: string };

/** Fin du parcours anonyme : le teaser montre le projet écrit (si on a pu l'extraire). */
type AnonDone = { projectName: string; extract: IdeaExtract | null };

export function DiagnosticEntry({ isAuthed = false }: { isAuthed?: boolean }) {
  const t = useTranslations("Diagnostic.entry");
  const [mode, setMode] = useState<Mode | null>(null);
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [submitted, setSubmitted] = useState<AnonDone | null>(null);

  function handleAnonSubmit(projectName: string, extract: IdeaExtract | null) {
    setSubmitted({ projectName, extract });
  }

  function handleExtracted(extract: IdeaExtract, description: string) {
    setExtracted({ extract, description });
  }

  function reset() {
    setExtracted(null);
    setMode(null);
  }

  // Anonyme : récit organisé → teaser « ton projet est déjà écrit ».
  if (submitted !== null) {
    return (
      <DiagnosticTeaser projectName={submitted.projectName} extract={submitted.extract} />
    );
  }

  if (mode === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className="group rounded-2xl border border-border bg-card p-6 text-left transition-colors hover:border-coral-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-coral/15 text-coral-strong">
            <PenLine className="size-6" />
          </span>
          <h3 className="mt-4 font-display text-lg font-bold">{t("manualTitle")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("manualText")}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode("upload")}
          className="group rounded-2xl border border-border bg-card p-6 text-left transition-colors hover:border-coral-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <UploadCloud className="size-6" />
          </span>
          <h3 className="mt-4 font-display text-lg font-bold">{t("uploadTitle")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("uploadText")}
          </p>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={reset}>
        <ArrowLeft className="size-4" />
        {t("changeMethod")}
      </Button>
      <Card className="p-6">
        {mode === "manual" ? (
          <RaconteDiagnostic isAuthed={isAuthed} onAnonSubmit={handleAnonSubmit} />
        ) : extracted ? (
          /* Fichier extrait → RaconteDiagnostic démarre directement en organize */
          <RaconteDiagnostic
            isAuthed={isAuthed}
            onAnonSubmit={handleAnonSubmit}
            initialExtract={extracted.extract}
            initialDescription={extracted.description}
          />
        ) : (
          <UploadDiagnostic
            isAuthed={isAuthed}
            onExtracted={handleExtracted}
            onAnonSubmit={handleAnonSubmit}
          />
        )}
      </Card>
    </div>
  );
}
