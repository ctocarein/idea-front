import Link from "next/link";
import { ArrowRight, Mic } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config/routes";

/**
 * Carte d'accès au simulateur de pitch (hub dashboard). Pas de chiffres tant qu'un
 * endpoint d'historique des sessions n'existe pas — on évite toute fausse progression.
 */
export function PitchProgress({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-full bg-coral/15 text-coral-strong">
          <Mic className="size-5" />
        </span>
        <h3 className="font-display text-base font-bold">Simulateur de pitch</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Affronte un comité virtuel — sans jugement, sans enjeu. Rejoue autant que tu veux.
      </p>
      <Link
        href={routes.pitchSim}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-coral-strong hover:underline"
      >
        S&apos;entraîner
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
