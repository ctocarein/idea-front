"use client";

import { useState } from "react";
import { ArrowLeft, PenLine, UploadCloud } from "lucide-react";

import { Button, Card } from "@/shared/ui";
import type { RadarScore } from "@/features/scoring";
import { RaconteDiagnostic } from "./RaconteDiagnostic";
import { UploadDiagnostic } from "./UploadDiagnostic";
import { DiagnosticResult } from "./DiagnosticResult";
import { DiagnosticTeaser } from "./DiagnosticTeaser";

type Mode = "manual" | "upload";
type Result = { score: RadarScore; projectName: string };

export function DiagnosticEntry({ isAuthed = false }: { isAuthed?: boolean }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  function handleComplete(score: RadarScore, projectName: string) {
    setResult({ score, projectName });
  }
  function handleAnonSubmit(projectName: string) {
    setSubmitted(projectName);
  }

  // Anonyme : diagnostic rempli → teaser verrouillé (le bilan reste derrière l'inscription).
  if (submitted !== null) {
    return <DiagnosticTeaser projectName={submitted} />;
  }

  // Connecté via upload (placeholder mock, en attendant le pipeline d'extraction backend).
  if (result) {
    return (
      <div className="space-y-6">
        <DiagnosticResult
          score={result.score}
          projectName={result.projectName}
          isAuthed={isAuthed}
        />
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => {
              setResult(null);
              setMode(null);
            }}
          >
            Refaire un diagnostic
          </Button>
        </div>
      </div>
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
          <h3 className="mt-4 font-display text-lg font-bold">
            Écrire mon idée
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Réponds à des questions guidées, adaptées à ta catégorie.
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
          <h3 className="mt-4 font-display text-lg font-bold">
            Uploader mon projet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tu as déjà un document ? On l&apos;analyse sans tout ressaisir.
          </p>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
        <ArrowLeft className="size-4" />
        Changer de méthode
      </Button>
      <Card className="p-6">
        {mode === "manual" ? (
          <RaconteDiagnostic isAuthed={isAuthed} onAnonSubmit={handleAnonSubmit} />
        ) : (
          <UploadDiagnostic
            isAuthed={isAuthed}
            onComplete={handleComplete}
            onAnonSubmit={handleAnonSubmit}
          />
        )}
      </Card>
    </div>
  );
}
