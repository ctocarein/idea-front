"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { toast } from "@/shared/ui";
import { startManualDiagnostic } from "../api/actions";
import { clearPendingDiagnostic, loadPendingDiagnostic } from "../lib/pending";

/**
 * Rattache un diagnostic fait en anonyme. Monté sur le dashboard : au premier rendu post-auth,
 * si un payload attend en localStorage, on le rejoue contre le vrai pipeline (`POST /diagnostics`)
 * puis on emmène le porteur vers son bilan. Le « Garder mon bilan » tient enfin sa promesse.
 */
export function ClaimPendingDiagnostic() {
  const router = useRouter();
  const ran = useRef(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const pending = loadPendingDiagnostic();
    if (!pending) return;

    // Run-once après montage, gardé par `ran` → pas de cascade de rendus.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClaiming(true);
    void (async () => {
      const res = await startManualDiagnostic(pending);
      clearPendingDiagnostic();
      if (res.ok) {
        toast.success("Ton bilan t'attendait — on l'a rattaché à ton espace.");
        router.push(routes.bilan(res.reportId));
      } else {
        setClaiming(false);
        toast.error(res.message);
      }
    })();
  }, [router]);

  if (!claiming) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin text-coral-strong" />
      On rattache ton diagnostic à ton espace…
    </div>
  );
}
