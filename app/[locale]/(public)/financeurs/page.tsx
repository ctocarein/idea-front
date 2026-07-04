import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Pour les financeurs",
  description: "Un flux de projets réellement préparés et qualifiés.",
};

const VALUE = [
  "Des projets déjà structurés, pas des idées brutes.",
  "Une évaluation commune et lisible (le Radar de Collision).",
  "Le temps que tu passerais à trier, économisé.",
];

export default function FinanceursPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <span className="flex size-12 items-center justify-center rounded-full bg-dawn text-ink">
        <ShieldCheck className="size-6" />
      </span>
      <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Ne voyez que des dossiers prêts.
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Ideaxion prépare les porteurs en amont. Vous recevez des projets
        qualifiés, évalués sur un référentiel commun — vous gagnez le temps que
        vous passeriez à trier le bruit.
      </p>

      <ul className="mt-8 space-y-3">
        {VALUE.map((v) => (
          <li key={v} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
            <span>{v}</span>
          </li>
        ))}
      </ul>

      <p className="mt-8 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        Au démarrage, la mise en relation est personnelle : nous vous présentons
        nous-mêmes les meilleurs projets. Écris-nous pour rejoindre le cercle.
      </p>

      <div className="mt-8">
        <Button asChild>
          <Link href={routes.contact}>Nous contacter</Link>
        </Button>
      </div>
    </div>
  );
}
