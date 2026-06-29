"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { File as FileIcon, Loader2, Trash2 } from "lucide-react";

import { EmptyState, FileUpload, toast } from "@/shared/ui";
import { requestUploadUrl, confirmUpload, deleteDocument } from "./actions";
import type { DocumentOut } from "./api";

const ACCEPT = ".pdf,.docx,.doc,.pptx,.txt,.png,.jpg,.jpeg";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} Mo` : `${Math.ceil(bytes / 1024)} Ko`;
}

export function DocumentsManagerClient({ initialDocs }: { initialDocs: DocumentOut[] }) {
  const router = useRouter();
  const [docs, setDocs] = useState(initialDocs);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadKey, setUploadKey] = useState(0); // reset FileUpload after success
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleFileChange(file: File | null) {
    if (!file || isUploading) return;
    setIsUploading(true);
    try {
      // 1. Demander l'URL presignée au backend
      const urlRes = await requestUploadUrl(file.name, file.type, file.size);
      if (!urlRes.ok) {
        toast.error(urlRes.message);
        return;
      }

      // 2. PUT direct sur MinIO (le client uploade, l'API ne fait jamais transiter les octets)
      const putRes = await fetch(urlRes.data.upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!putRes.ok) {
        toast.error("Upload échoué. Vérifie ta connexion et réessaie.");
        return;
      }

      // 3. Confirmer côté backend (vérifie taille + type réels)
      const confirmRes = await confirmUpload(urlRes.data.document_id);
      if (!confirmRes.ok) {
        toast.error(confirmRes.message);
        return;
      }

      setDocs((prev) => [confirmRes.doc, ...prev]);
      setUploadKey((k) => k + 1); // remet la zone de dépôt à zéro
      toast.success(`${file.name} ajouté`);
      router.refresh();
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(doc: DocumentOut) {
    setDeletingId(doc.id);
    try {
      const res = await deleteDocument(doc.id);
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== doc.id));
        toast(`${doc.filename} supprimé`);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <FileUpload
          key={uploadKey}
          accept={ACCEPT}
          maxSizeMb={20}
          onFileChange={handleFileChange}
          hint="PDF, DOCX, PPTX, image — 20 Mo max"
        />
        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70">
            <Loader2 className="size-6 animate-spin text-coral-strong" />
            <span className="ml-2 text-sm font-medium">Upload en cours…</span>
          </div>
        ) : null}
      </div>

      {docs.length === 0 ? (
        <EmptyState
          icon={FileIcon}
          title="Aucun document"
          description="Business plan, pitch deck, preuves de traction — centralise tout ici."
        />
      ) : (
        <ul className="space-y-2">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                <FileIcon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{doc.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(doc.size)} · {dateFmt.format(new Date(doc.created_at))}
                  {doc.status === "pending" ? " · En attente" : null}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Supprimer ${doc.filename}`}
                onClick={() => handleDelete(doc)}
                disabled={deletingId === doc.id}
                className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 disabled:opacity-50"
              >
                {deletingId === doc.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
