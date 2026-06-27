import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import { RadarChart, sampleScore } from "@/features/scoring";

/**
 * Teaser verrouillé (porteur anonyme). Le bilan est la récompense → on NE le révèle pas
 * sans inscription. On crée l'envie (radar flouté + ce qui est débloqué) sans afficher
 * de chiffre : le vrai bilan est calculé par le LLM une fois l'espace créé.
 */
export function DiagnosticTeaser({ projectName }: { projectName: string }) {
  return (
    <div className="space-y-6 text-center">
      <div>
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-dawn text-ink">
          <Sparkles className="size-6" />
        </span>
        <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
          Ton bilan est prêt
        </h2>
        <p className="mx-auto mt-1 max-w-md text-muted-foreground">
          <span className="font-medium text-ink">{projectName || "Ton projet"}</span> a été passé
          au crible sur <span className="font-medium text-ink">12 dimensions</span> — forces,
          angles morts et plan d&apos;action.
        </p>
      </div>

      {/* Radar flouté + cadenas : on devine la boussole, sans la révéler. */}
      <div className="relative mx-auto w-fit">
        <div className="pointer-events-none select-none opacity-30 blur-md" aria-hidden>
          <RadarChart score={sampleScore} size={240} />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="flex size-12 items-center justify-center rounded-full bg-card shadow-lg ring-1 ring-border">
            <Lock className="size-5 text-coral-strong" />
          </span>
          <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-medium shadow-sm ring-1 ring-border">
            Verrouillé
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Crée ton espace (gratuit) pour révéler : ton <span className="font-medium text-ink">Radar
          de Collision</span> sur 12 dimensions, tes <span className="font-medium text-ink">forces</span> et
          <span className="font-medium text-ink"> angles morts</span> expliqués, un{" "}
          <span className="font-medium text-ink">plan d&apos;action priorisé</span> et un{" "}
          <span className="font-medium text-ink">rapport téléchargeable</span>.
        </p>
        <Button asChild size="md" className="mt-4">
          <Link href={routes.register}>Créer mon espace pour voir mon bilan</Link>
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Ton diagnostic t&apos;attend — il sera rattaché à ton espace dès l&apos;inscription.
        </p>
      </div>
    </div>
  );
}
