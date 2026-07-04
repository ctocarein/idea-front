"use client";

import { useTranslations } from "next-intl";
import { Download } from "lucide-react";

import { Button } from "@/shared/ui";

/** Ouvre le bilan HTML dans un nouvel onglet — Ctrl+P pour imprimer en PDF. */
export function BilanPdfButton({ reportId }: { reportId: string }) {
  const t = useTranslations("Bilan.pdf");
  return (
    <Button
      variant="outline"
      onClick={() => window.open(`/api/bilan/${reportId}/html`, "_blank", "noopener,noreferrer")}
    >
      <Download className="size-5" />
      {t("download")}
    </Button>
  );
}
