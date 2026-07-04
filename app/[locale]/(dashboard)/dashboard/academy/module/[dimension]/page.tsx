import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { ModuleFlow } from "@/features/academy";
import type { ModuleSessionData } from "@/features/academy/actions";

/** Dimensions valides du radar (les libellés viennent du namespace Radar). */
const DIMENSIONS = new Set(
  Array.from({ length: 12 }, (_, i) => `d${i + 1}`),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dimension: string }>;
}): Promise<Metadata> {
  const { dimension } = await params;
  if (!DIMENSIONS.has(dimension)) return { title: "Module" };
  const tRadar = await getTranslations("Radar");
  return { title: `Module — ${tRadar(`${dimension}.label`)}` };
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

  if (!DIMENSIONS.has(dimension)) return notFound();

  const t = await getTranslations("Workshop.module");
  const tRadar = await getTranslations("Radar");
  const label = tRadar(`${dimension}.label`);

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
          href={routes.academy}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {t("back")}
        </Link>
        <p className="text-destructive">
          {t("startError")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={routes.academy}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> {t("back")}
      </Link>

      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary uppercase tracking-wider">
              {dimension.toUpperCase()}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight mt-2">{label}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("intro")}
          </p>
        </div>

        <ModuleFlow initial={session} />
      </div>
    </div>
  );
}
