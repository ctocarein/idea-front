"use client";

import Link from "next/link";
import { Palette, Type, ArrowRight, ImageOff } from "lucide-react";

import { Button } from "@/shared/ui";
import type { KitData } from "../actions";

const SWATCHES: { key: "primary" | "secondary" | "accent" | "bg"; label: string }[] = [
  { key: "primary", label: "Primaire" },
  { key: "secondary", label: "Secondaire" },
  { key: "accent", label: "Accent" },
  { key: "bg", label: "Fond" },
];

export function BrandKit({ kit, logoRoute, deckRoute }: { kit: KitData; logoRoute: string; deckRoute: string }) {
  if (!kit.has_logo || !kit.palette) {
    return (
      <div className="rounded-2xl border border-dashed py-16 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ImageOff className="size-7" />
        </div>
        <h2 className="font-display text-lg font-bold">Pas encore d&apos;identité</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Ton kit de marque se déduit de ton logo — couleurs et typographie. Crée d&apos;abord ton logo.
        </p>
        <Button className="mt-5" asChild>
          <Link href={logoRoute}>Créer mon logo <ArrowRight className="ml-1.5 size-4" /></Link>
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
          <h2 className="font-display text-sm font-bold text-muted-foreground">Ton logo</h2>
          <Link href={logoRoute} className="text-xs font-medium text-primary hover:underline">Éditer</Link>
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
            <h2 className="font-display text-sm font-bold">Palette</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SWATCHES.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2.5">
                <span className="size-10 shrink-0 rounded-lg border" style={{ background: kit.palette![key] }} />
                <div className="min-w-0">
                  <p className="text-xs font-medium">{label}</p>
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
            <h2 className="font-display text-sm font-bold">Typographie</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Titres — {kit.display_font}</p>
              <p className="text-2xl font-bold" style={{ fontFamily: `'${kit.display_font}', sans-serif` }}>
                Aa Bb Cc
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Texte — {kit.body_font}</p>
              <p className="text-base" style={{ fontFamily: `'${kit.body_font}', sans-serif` }}>
                Le vif renard brun saute par-dessus le chien.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appliqué au deck */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <p className="text-sm">
          Ce kit habille automatiquement ton <strong>deck de pitch</strong> — couleurs, typo et logo.
        </p>
        <Button size="sm" variant="outline" asChild>
          <Link href={deckRoute}>Voir mon deck <ArrowRight className="ml-1.5 size-3.5" /></Link>
        </Button>
      </div>
    </div>
  );
}
