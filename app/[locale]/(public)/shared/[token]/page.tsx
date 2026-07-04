import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Star } from "lucide-react";
import { notFound } from "next/navigation";

import { env } from "@/shared/config/env";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";

interface SharedFicheOut {
  project_title: string;
  sector: string;
  maturity: string | null;
  overall_100: number;
  summary: string;
  strengths: string[];
  scored_by: string;
}

async function getFiche(token: string): Promise<SharedFicheOut | null> {
  try {
    const res = await fetch(`${env.backendUrl}/api/v1/shared/${token}`, {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as SharedFicheOut;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const fiche = await getFiche(token);
  if (!fiche) return { title: "Fiche introuvable" };
  return {
    title: `${fiche.project_title} · Fiche projet Ideaxion`,
    description: fiche.summary?.slice(0, 160),
  };
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "from-emerald-500 to-teal-500"
      : score >= 50
        ? "from-amber-500 to-orange-500"
        : "from-rose-500 to-red-500";
  return (
    <div
      className={`inline-flex h-24 w-24 flex-col items-center justify-center rounded-full bg-gradient-to-br ${color} text-white shadow-lg`}
    >
      <span className="font-display text-3xl font-extrabold leading-none">
        {score}
      </span>
      <span className="text-xs font-medium opacity-80">/100</span>
    </div>
  );
}

export default async function SharedFichePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const fiche = await getFiche(token);

  if (!fiche) notFound();

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Fiche projet certifiée
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            {fiche.project_title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {fiche.sector}
            {fiche.maturity ? ` · ${fiche.maturity}` : ""}
          </p>
        </div>
        <ScoreBadge score={fiche.overall_100} />
      </div>

      {/* Credential */}
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
        <ShieldCheck className="size-5 shrink-0 text-emerald-500" />
        <p className="text-sm text-muted-foreground">
          Score évalué par{" "}
          <span className="font-semibold text-foreground">{fiche.scored_by}</span>{" "}
          — grille d&apos;évaluation multi-dimensionnelle, 12 axes.
        </p>
      </div>

      {/* Summary */}
      {fiche.summary && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Synthèse
          </h2>
          <p className="text-base leading-relaxed">{fiche.summary}</p>
        </section>
      )}

      {/* Strengths */}
      {fiche.strengths.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Points forts identifiés
          </h2>
          <ul className="space-y-2">
            {fiche.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <span className="text-sm leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Powered by + CTA */}
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <div className="mb-1 flex items-center justify-center gap-1.5">
          <Star className="size-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Propulsé par Ideaxion
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette fiche a été préparée et évaluée sur la plateforme Ideaxion —
          parcours gratuit pour porteurs de projets africains.
        </p>
        <Button asChild className="mt-4">
          <Link href={routes.diagnostic}>
            Évalue ton projet gratuitement
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
