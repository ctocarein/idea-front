import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { apiFetch } from "@/shared/api/client";
import { ModuleFlow } from "@/features/academy/components/ModuleFlow";
import type { ModuleSessionData } from "@/features/academy/actions";

const DIMENSION_LABELS: Record<string, string> = {
  d1: "Problème",
  d2: "Solution",
  d3: "Proposition de valeur",
  d4: "Marché",
  d5: "Concurrence",
  d6: "Modèle économique",
  d7: "Traction & Preuves",
  d8: "Potentiel de croissance",
  d9: "Go-to-Market",
  d10: "Équipe & Compétences",
  d11: "Niveau d'avancement",
  d12: "Risques & Freins",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dimension: string }>;
}): Promise<Metadata> {
  const { dimension } = await params;
  const label = DIMENSION_LABELS[dimension] ?? dimension;
  return { title: `Module — ${label}` };
}

export default async function ModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ dimension: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const { dimension } = await params;
  const { session: sessionId } = await searchParams;
  const label = DIMENSION_LABELS[dimension];

  if (!label) return notFound();

  let session: ModuleSessionData | null = null;

  // Si une session existante est passée en query param, la charger
  if (sessionId) {
    try {
      session = await apiFetch<ModuleSessionData>(
        `/api/v1/academy/modules/${sessionId}`,
      );
    } catch {
      // session invalide, on va en créer une nouvelle
    }
  }

  // Sinon démarrer un nouveau module (idempotent côté back)
  if (session === null) {
    try {
      session = await apiFetch<ModuleSessionData>("/api/v1/academy/modules/start", {
        method: "POST",
        json: { dimension },
      });
    } catch {
      // Le serveur est indisponible
    }
  }

  if (session === null) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/academy"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Retour à l&apos;Academy
        </Link>
        <p className="text-destructive">
          Impossible de démarrer ce module. Vérifie ta connexion et réessaie.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/dashboard/academy"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" /> Retour à l&apos;Academy
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary uppercase tracking-wider">
            {dimension.toUpperCase()}
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight mt-2">{label}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Travaille cet axe avec le coach, complète le formulaire, découvre tes besoins.
        </p>
      </div>

      <ModuleFlow initial={session} />
    </div>
  );
}
