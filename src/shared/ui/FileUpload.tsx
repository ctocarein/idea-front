"use client";

import { useRef, useState } from "react";
import { File as FileIcon, UploadCloud, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

/**
 * FileUpload — zone de dépôt (CHARTE_FRONTEND.md §2.2). Au MVP, l'upload réel
 * se fait en presigned vers MinIO (branché au Sprint INT) ; ici on gère la
 * sélection, le drag & drop et l'affichage du fichier choisi.
 */
export interface FileUploadProps {
  /** Types MIME / extensions acceptés (attribut accept). */
  accept?: string;
  /** Taille max en Mo (validation UX ; le backend re-valide). */
  maxSizeMb?: number;
  /** Notifié à chaque (dé)sélection de fichier valide. */
  onFileChange?: (file: File | null) => void;
  className?: string;
  hint?: string;
}

function formatSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} Mo` : `${Math.ceil(bytes / 1024)} Ko`;
}

export function FileUpload({
  accept,
  maxSizeMb = 20,
  onFileChange,
  className,
  hint = "PDF ou DOCX, 20 Mo max",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function select(next: File | null) {
    if (next && next.size > maxSizeMb * 1024 * 1024) {
      setError(`Fichier trop lourd (${maxSizeMb} Mo max).`);
      return;
    }
    setError(null);
    setFile(next);
    onFileChange?.(next);
  }

  if (file) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-md border border-border bg-card p-3.5",
          className,
        )}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
          <FileIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatSize(file.size)}
          </p>
        </div>
        <button
          type="button"
          aria-label="Retirer le fichier"
          onClick={() => select(null)}
          className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          select(e.dataTransfer.files?.[0] ?? null);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
          dragging
            ? "border-coral-strong bg-coral/5"
            : "border-border bg-card hover:bg-secondary/50",
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <UploadCloud className="size-6" />
        </span>
        <span className="text-sm font-medium text-foreground">
          Glisse ton fichier ou clique pour choisir
        </span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => select(e.target.files?.[0] ?? null)}
      />
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
