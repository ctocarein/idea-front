import type { Metadata } from "next";

import { getSession } from "@/shared/auth/server";
import { DiagnosticEntry } from "@/features/diagnostics";

export const metadata: Metadata = {
  title: "Diagnostic",
  description:
    "Écris ton idée ou uploade ton projet — comprends tes forces et tes angles morts, gratuitement.",
};

export default async function DiagnosticPage() {
  // Diagnostic = public (aucune auth requise). On lit juste la session pour adapter le
  // CTA récompense : le bilan/PDF est la porte d'auth (connecté → son espace, anonyme → onboarding).
  const isAuthed = Boolean(await getSession());
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <header className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Gratuit · sans pression
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
          Comprends ton projet
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          En quelques minutes, obtiens ton tableau de compréhension — essence,
          viabilité, scalabilité. On part d&apos;où tu es.
        </p>
      </header>
      <DiagnosticEntry isAuthed={isAuthed} />
    </div>
  );
}
