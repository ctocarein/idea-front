"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";

import { Button, toast } from "@/shared/ui";
import { getReportPdfUrl } from "../actions";

/** Télécharge le PDF du bilan (URL présignée). Gère le cas « pas encore prêt » sans planter. */
export function BilanPdfButton({ reportId }: { reportId: string }) {
  const [pending, start] = useTransition();

  function download() {
    start(async () => {
      const res = await getReportPdfUrl(reportId);
      if (res.ok) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      } else if (res.reason === "pending") {
        toast.error("Ton rapport se prépare encore — réessaie dans un instant.");
      } else {
        toast.error("Téléchargement indisponible pour l'instant.");
      }
    });
  }

  return (
    <Button variant="outline" onClick={download} loading={pending}>
      <Download className="size-5" />
      Télécharger le PDF
    </Button>
  );
}
