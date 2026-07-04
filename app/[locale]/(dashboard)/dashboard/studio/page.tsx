import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Presentation, Shapes, Palette, FileText, type LucideIcon } from "lucide-react";

import { apiFetch } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { Card, CardContent } from "@/shared/ui";
import type { PitchData } from "@/features/pitch-editor";
import type { LogoData } from "@/features/studio";

export const metadata: Metadata = { title: "Studio" };

export default async function StudioPage() {
  const [pitch, logo] = await Promise.all([
    apiFetch<PitchData>("/api/v1/pitch").catch(() => null),
    apiFetch<LogoData>("/api/v1/studio/logo").catch(() => null),
  ]);

  const deckCount = pitch?.slides?.length ?? 0;
  const logoReady = !!logo?.spec;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Studio</h1>
        <p className="text-muted-foreground">
          Donne un visage à ton projet. Chaque asset part de ton diagnostic et de ton travail
          dans le Workshop — pour une identité cohérente partout.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Door
          icon={Presentation}
          title="Pitch / Deck"
          desc="Un deck visuel prêt à pitcher, généré et éditable."
          href={routes.pitchEditor}
          status={deckCount > 0 ? `${deckCount} slides` : "À créer"}
          ready={deckCount > 0}
        />
        <Door
          icon={Shapes}
          title="Logo & identité"
          desc="Une marque vectorielle sur mesure — icône, monogramme, couleurs, typo."
          href={`${routes.studio}/logo`}
          status={logoReady ? "Prêt" : "À créer"}
          ready={logoReady}
        />
        <Door
          icon={Palette}
          title="Kit de marque"
          desc="Palette et typographies dérivées de ton logo, réutilisées dans le deck."
          href={`${routes.studio}/kit`}
          status={logoReady ? "Prêt" : "À créer"}
          ready={logoReady}
        />
        <Door
          icon={FileText}
          title="One-pager"
          desc="Une fiche projet d'une page, à envoyer ou imprimer."
          soon
        />
      </div>
    </div>
  );
}

function Door({
  icon: Icon,
  title,
  desc,
  href,
  status,
  ready,
  soon,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  href?: string;
  status?: string;
  ready?: boolean;
  soon?: boolean;
}) {
  const inner = (
    <Card className={`h-full transition-shadow ${soon ? "opacity-60" : "hover:shadow-sm hover:border-border-strong"}`}>
      <CardContent className="flex h-full flex-col gap-3 pt-6 pb-5">
        <div className="flex items-start justify-between">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          {soon ? (
            <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Bientôt
            </span>
          ) : (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                ready ? "bg-primary/10 text-primary" : "border text-muted-foreground"
              }`}
            >
              {status}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
        {!soon && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {ready ? "Continuer" : "Commencer"} <ArrowRight className="size-3.5" />
          </span>
        )}
      </CardContent>
    </Card>
  );

  if (soon || !href) return <div>{inner}</div>;
  return <Link href={href}>{inner}</Link>;
}
