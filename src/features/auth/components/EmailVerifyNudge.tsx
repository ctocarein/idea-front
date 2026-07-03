"use client";

import { useState, useTransition } from "react";
import { MailWarning, Loader2, Check } from "lucide-react";

import { toast } from "@/shared/ui";
import { resendVerification } from "../api/actions";

/** Bandeau doux : confirme ton email (soft gate — n'empêche pas l'accès). */
export function EmailVerifyNudge() {
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);

  function resend() {
    start(async () => {
      const r = await resendVerification();
      if (r.ok) {
        setSent(true);
        toast.success("Lien envoyé — vérifie ta boîte mail (et les spams).");
      } else {
        toast.error("Envoi impossible. Réessaie dans un instant.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm">
      <span className="flex items-center gap-2 text-foreground/80">
        <MailWarning className="size-4 shrink-0 text-amber-600" />
        Confirme ton adresse email pour sécuriser ton espace.
      </span>
      <button
        type="button"
        onClick={resend}
        disabled={pending || sent}
        className="inline-flex items-center gap-1.5 font-medium text-amber-700 hover:underline disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : sent ? <Check className="size-3.5" /> : null}
        {sent ? "Lien envoyé" : "Renvoyer le lien"}
      </button>
    </div>
  );
}
