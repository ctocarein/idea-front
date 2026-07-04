import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, GraduationCap, Mic, Target } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Pour les startups",
  description: "Comment Ideaxion rend les porteurs capables et confiants.",
};

const JOURNEY = [
  {
    icon: Compass,
    title: "Comprendre",
    text: "Diagnostic gratuit (idée guidée ou upload) → ton tableau de compréhension sur 3 lentilles.",
  },
  {
    icon: GraduationCap,
    title: "Apprendre",
    text: "Modules pédagogiques + assistant qui t'explique pendant que TU écris ta propre version.",
  },
  {
    icon: Mic,
    title: "S'exercer",
    text: "Le simulateur de pitch te fait répéter face à une IA-investisseur, sans jugement.",
  },
  {
    icon: Target,
    title: "Réaliser",
    text: "La page readiness te montre où tu en es — et la suite, sans pression d'achat.",
  },
];

export default function StartupsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          On te rend capable, puis confiant.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tout le parcours porteur est gratuit. Tu comprends ton projet, tu
          apprends à le structurer, tu t&apos;entraînes — et tu décides
          toi-même d&apos;aller plus loin.
        </p>
      </header>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {JOURNEY.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-coral/15 text-coral-strong">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold">{s.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-12">
        <Button asChild>
          <Link href={routes.diagnostic}>
            Lancer mon diagnostic
            <ArrowRight className="size-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
