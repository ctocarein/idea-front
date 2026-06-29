"use client";

import { Download } from "lucide-react";

import { Button } from "@/shared/ui";

/** Ouvre le bilan HTML dans un nouvel onglet — Ctrl+P pour imprimer en PDF. */
export function BilanPdfButton({ reportId }: { reportId: string }) {
  return (
    <Button
      variant="outline"
      onClick={() => window.open(`/api/bilan/${reportId}/html`, "_blank", "noopener,noreferrer")}
    >
      <Download className="size-5" />
      Télécharger le bilan
    </Button>
  );
}
