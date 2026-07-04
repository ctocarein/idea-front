"use client";

import { useTranslations } from "next-intl";
import { Palette, Type, ArrowRight, ImageOff } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui";
import type { KitData } from "../actions";

const SWATCH_KEYS: ("primary" | "secondary" | "accent" | "bg")[] = ["primary", "secondary", "accent", "bg"];

export function BrandKit({ kit, logoRoute, deckRoute }: { kit: KitData; logoRoute: string; deckRoute: string }) {
  const t = useTranslations("Studio.kit");
  if (!kit.has_logo || !kit.palette) {
    return (
      <div className="rounded-2xl border border-dashed py-16 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ImageOff className="size-7" />
        </div>
        <h2 className="font-display text-lg font-bold">{t("emptyTitle")}</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          {t("emptyText")}
        </p>
        <Button className="mt-5" asChild>
          <Link href={logoRoute}>{t("createLogo")} <ArrowRight className="ml-1.5 size-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {kit.font_import && <style>{`@import url("${kit.font_import}");`}</style>}

      {/* Logo */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-muted-foreground">{t("yourLogo")}</h2>
          <Link href={logoRoute} className="text-xs font-medium text-primary hover:underline">{t("edit")}</Link>
        </div>
        {kit.logo_svg && (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border bg-white p-6 [&_svg]:max-h-24 [&_svg]:w-auto"
            dangerouslySetInnerHTML={{ __html: kit.logo_svg }} />
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Palette */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Palette className="size-4 text-primary" />
            <h2 className="font-display text-sm font-bold">{t("palette")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SWATCH_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-2.5">
                <span className="size-10 shrink-0 rounded-lg border" style={{ background: kit.palette![key] }} />
                <div className="min-w-0">
                  <p className="text-xs font-medium">{t(`swatch.${key}`)}</p>
                  <p className="font-mono text-xs text-muted-foreground uppercase">{kit.palette![key]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typographie */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Type className="size-4 text-primary" />
            <h2 className="font-display text-sm font-bold">{t("typography")}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">{t("headings")} — {kit.display_font}</p>
              <p className="text-2xl font-bold" style={{ fontFamily: `'${kit.display_font}', sans-serif` }}>
                Aa Bb Cc
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("body")} — {kit.body_font}</p>
              <p className="text-base" style={{ fontFamily: `'${kit.body_font}', sans-serif` }}>
                {t("pangram")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appliqué au deck */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <p className="text-sm">
          {t.rich("deckNote", { b: (chunks) => <strong>{chunks}</strong> })}
        </p>
        <Button size="sm" variant="outline" asChild>
          <Link href={deckRoute}>{t("viewDeck")} <ArrowRight className="ml-1.5 size-3.5" /></Link>
        </Button>
      </div>
    </div>
  );
}
