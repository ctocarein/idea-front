"use client";

import { useState } from "react";
import { ArrowLeft, PenLine, UploadCloud } from "lucide-react";

import { Button, Card } from "@/shared/ui";
import type { IdeaExtract } from "../api/actions";
import { RaconteDiagnostic } from "./RaconteDiagnostic";
import { UploadDiagnostic } from "./UploadDiagnostic";
import { DiagnosticTeaser } from "./DiagnosticTeaser";

type Mode = "manual" | "upload";

/** État intermédiaire : l'extraction de fichier a réussi, on enchaîne sur organize. */
type Extracted = { extract: IdeaExtract; description: string };

export function DiagnosticEntry({ isAuthed = false }: { isAuthed?: boolean }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  function handleAnonSubmit(projectName: string) {
    setSubmitted(projectName);
  }

  function handleExtracted(extract: IdeaExtract, description: string) {
    setExtracted({ extract, description });
  }

  function reset() {
    setExtracted(null);
    setMode(null);
  }

  // Anonyme : diagnostic rempli → teaser verrouillé.
  if (submitted !== null) {
    return <DiagnosticTeaser projectName={submitted} />;
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
          <h3 className="mt-4 font-display text-lg font-bold">Raconte ton idée</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            En quelques phrases — le LLM organise, on comble les trous ensemble.
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
          <h3 className="mt-4 font-display text-lg font-bold">Uploader mon projet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tu as déjà un document ? On l&apos;analyse — même pipeline que le récit libre.
          </p>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={reset}>
        <ArrowLeft className="size-4" />
        Changer de méthode
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
