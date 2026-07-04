import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Presentation, Shapes, Palette, FileText, type LucideIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/shared/api/client";
import { routes } from "@/shared/config/routes";
import { Card, CardContent } from "@/shared/ui";
import type { PitchData } from "@/features/pitch-editor";
import type { LogoData } from "@/features/studio";

export const metadata: Metadata = { title: "Studio" };

export default async function StudioPage() {
  const t = await getTranslations("Studio");
  const [pitch, logo] = await Promise.all([
    apiFetch<PitchData>("/api/v1/pitch").catch(() => null),
    apiFetch<LogoData>("/api/v1/studio/logo").catch(() => null),
  ]);

  const deckCount = pitch?.slides?.length ?? 0;
  const logoReady = !!logo?.spec;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Door
          icon={Presentation}
          title={t("doors.deckTitle")}
          desc={t("doors.deckDesc")}
          href={routes.pitchEditor}
          status={deckCount > 0 ? t("status.slides", { count: deckCount }) : t("status.todo")}
          ready={deckCount > 0}
          cta={deckCount > 0 ? t("continue") : t("start")}
        />
        <Door
          icon={Shapes}
          title={t("doors.logoTitle")}
          desc={t("doors.logoDesc")}
          href={`${routes.studio}/logo`}
          status={logoReady ? t("status.ready") : t("status.todo")}
          ready={logoReady}
          cta={logoReady ? t("continue") : t("start")}
        />
        <Door
          icon={Palette}
          title={t("doors.kitTitle")}
          desc={t("doors.kitDesc")}
          href={`${routes.studio}/kit`}
          status={logoReady ? t("status.ready") : t("status.todo")}
          ready={logoReady}
          cta={logoReady ? t("continue") : t("start")}
        />
        <Door
          icon={FileText}
          title={t("doors.onePagerTitle")}
          desc={t("doors.onePagerDesc")}
          soonLabel={t("status.soon")}
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
  soonLabel,
  cta,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  href?: string;
  status?: string;
  ready?: boolean;
  soon?: boolean;
  soonLabel?: string;
  cta?: string;
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
              {soonLabel}
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
            {cta} <ArrowRight className="size-3.5" />
          </span>
        )}
      </CardContent>
    </Card>
  );

  if (soon || !href) return <div>{inner}</div>;
  return <Link href={href}>{inner}</Link>;
}
