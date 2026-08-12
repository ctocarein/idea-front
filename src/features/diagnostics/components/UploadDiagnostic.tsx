"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";

import { Button, FileUpload, toast } from "@/shared/ui";
import { type IdeaExtract, extractFileIdea } from "../api/actions";

/**
 * Flow B — upload PDF/DOCX → extraction de texte côté backend → même pipeline « Raconte ».
 *
 * Fonctionnalité **connectée uniquement** : l'extraction est serveur (et coûteuse), on ne la
 * fait pas en anonyme. DiagnosticEntry ne rend ce composant que pour un porteur authentifié.
 * Le résultat (`IdeaExtract` + `description`) remonte via `onExtracted` pour que DiagnosticEntry
 * bascule sur `RaconteDiagnostic` en mode organize (le « tell » est skippé).
 */
export function UploadDiagnostic({
  onExtracted,
}: {
  /** Extraction réussie → DiagnosticEntry affiche RaconteDiagnostic en mode organize. */
  onExtracted: (extract: IdeaExtract, description: string) => void;
}) {
  const t = useTranslations("Diagnostic.upload");
  const locale = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, startTransition] = useTransition();

  function analyze() {
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    form.append("project_name", file.name.replace(/\.[^.]+$/, ""));
    form.append("lang", locale);

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
        hint={t("hint")}
      />
      <Button
        onClick={analyze}
        disabled={!file}
        loading={analyzing}
        className="w-full"
      >
        {analyzing ? t("analyzing") : t("analyze")}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {t("note")}
      </p>
    </div>
  );
}
