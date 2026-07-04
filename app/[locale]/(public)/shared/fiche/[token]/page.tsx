import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { env } from "@/shared/config/env";
import { Button } from "@/shared/ui";

interface SharedFiche {
  need_type: string;
  title: string;
  description: string;
  details: Record<string, unknown>;
  project_title: string | null;
}

async function getFiche(token: string): Promise<SharedFiche | null> {
  try {
    const res = await fetch(`${env.backendUrl}/api/v1/academy/shared-fiche/${token}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as SharedFiche;
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
  const t = await getTranslations("Public.sharedNeed");
  if (!fiche) return { title: t("notFound") };
  return {
    title: `${fiche.title} · ${t("titleSuffix")}`,
    description: fiche.description?.slice(0, 160),
  };
}

function Field({ label, value }: { label: string; value: unknown }) {
  if (!value || typeof value !== "string") return null;
  return (
    <div className="flex justify-between gap-4 border-b py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
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

  const t = await getTranslations("Public.sharedNeed");
  const tf = await getTranslations("Workshop.fiche");
  const details = fiche.details ?? {};
  const skills = Array.isArray(details.skills) ? (details.skills as string[]) : [];
  const deliverables = Array.isArray(details.deliverables) ? (details.deliverables as string[]) : [];
  const typeLabel = tf.has(`types.${fiche.need_type}`) ? tf(`types.${fiche.need_type}`) : fiche.need_type;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl border bg-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-coral-strong">
          {t("eyebrow", { type: typeLabel })}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">{fiche.title}</h1>
        {fiche.project_title && (
          <p className="mt-1 text-sm text-muted-foreground">{fiche.project_title}</p>
        )}

        {fiche.description && (
          <p className="mt-4 text-sm leading-relaxed text-foreground">{fiche.description}</p>
        )}

        <div className="mt-6 space-y-0">
          <Field label={tf("profile")} value={details.profile} />
          <Field label={tf("budget")} value={details.budget} />
          <Field label={tf("timeline")} value={details.timeline} />
          <Field label={tf("engagementType")} value={details.engagement_type} />
        </div>

        {skills.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {tf("skills")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span key={i} className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {deliverables.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {tf("deliverables")}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {deliverables.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-dashed p-4">
        <p className="text-sm text-muted-foreground">
          {t("structuredWith")}
        </p>
        <Link href="/">
          <Button size="sm" variant="outline">
            {t("discover")} <ArrowRight className="ml-1.5 size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
