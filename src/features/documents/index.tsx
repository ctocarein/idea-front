"use client";

import { useState } from "react";
import { File as FileIcon, Trash2 } from "lucide-react";

import { Card, CardContent, EmptyState, FileUpload, toast } from "@/shared/ui";

/**
 * Feature documents — data room du porteur (BESOINS_PORTEUR cas 8).
 * Upload mocké (au Sprint INT : presigned MinIO, ≤ 20 Mo, types autorisés).
 */
type Doc = { id: string; name: string };

let nextId = 1;

export function DocumentsManager() {
  const [docs, setDocs] = useState<Doc[]>([
    { id: "seed", name: "business-plan-v1.pdf" },
  ]);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <h3 className="font-display text-base font-bold">Mes documents</h3>

        <FileUpload
          onFileChange={(f) => {
            if (!f) return;
            setDocs((d) => [...d, { id: `d${nextId++}`, name: f.name }]);
            toast.success("Document ajouté");
          }}
        />

        {docs.length === 0 ? (
          <EmptyState
            icon={FileIcon}
            title="Aucun document"
            description="Centralise les pièces de ton projet ici."
          />
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                  <FileIcon className="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{d.name}</span>
                <button
                  type="button"
                  aria-label={`Supprimer ${d.name}`}
                  onClick={() => {
                    setDocs((list) => list.filter((x) => x.id !== d.id));
                    toast("Document supprimé");
                  }}
                  className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
