"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/ui";
import { pollReportStatus } from "../actions";

/**
 * Attente du bilan : l'analyse tourne côté worker (LLM). On interroge le statut toutes les 3 s et
 * on rafraîchit la page dès qu'il est prêt. Au-delà de ~45 s, on propose un rafraîchissement manuel.
 */
export function BilanPending({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [slow, setSlow] = useState(false);
  const tries = useRef(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      const status = await pollReportStatus(reportId);
      if (!active) return;
      tries.current += 1;
      if (status === "ready" || status === "failed") {
        router.refresh();
        return;
      }
      if (tries.current >= 15) setSlow(true);
      timer = setTimeout(tick, 3000);
    };

    timer = setTimeout(tick, 3000);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [reportId, router]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <Loader2 className="size-10 animate-spin text-coral-strong" />
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold tracking-tight">
          On analyse ton projet…
        </h2>
        <p className="text-muted-foreground">
          On lit ton idée et on construit ta boussole sur les 12 dimensions. Quelques instants.
        </p>
      </div>
      {slow ? (
        <Button variant="outline" size="sm" onClick={() => router.refresh()}>
          Ça prend un peu plus de temps — rafraîchir
        </Button>
      ) : null}
    </div>
  );
}
