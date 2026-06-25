import type { Metadata } from "next";

import { ComponentsShowcase } from "./_components-showcase";

export const metadata: Metadata = {
  title: "Catalogue — Design system",
  description:
    "Référence vivante des tokens « Aube » : couleurs, typographie, rayons, ombres, motion.",
};

/* Catalogue interne (Sprint D0). Prouve que les tokens « Aube » sont câblés.
   Les composants du design system viendront s'ajouter ici au Sprint D1. */

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({
  name,
  className,
  note,
}: {
  name: string;
  className: string;
  note?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={`h-16 rounded-lg border border-border ${className}`}
        aria-hidden
      />
      <div className="text-xs font-medium">{name}</div>
      {note ? (
        <div className="text-xs text-muted-foreground">{note}</div>
      ) : null}
    </div>
  );
}

const semanticColors = [
  { name: "background", className: "bg-background" },
  { name: "foreground", className: "bg-foreground" },
  { name: "card", className: "bg-card" },
  { name: "primary", className: "bg-primary", note: "action (coral-strong)" },
  { name: "secondary", className: "bg-secondary" },
  { name: "muted", className: "bg-muted" },
  { name: "accent", className: "bg-accent" },
  { name: "destructive", className: "bg-destructive" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
  { name: "border", className: "bg-border" },
  { name: "ring", className: "bg-ring", note: "focus (coral)" },
];

const brandColors = [
  { name: "ink", className: "bg-ink", note: "la nuit" },
  { name: "ink-soft", className: "bg-ink-soft" },
  { name: "paper", className: "bg-paper" },
  { name: "coral", className: "bg-coral" },
  { name: "coral-strong", className: "bg-coral-strong" },
  { name: "gold", className: "bg-gold" },
  { name: "teal", className: "bg-teal" },
];

const typeScale = [
  { label: "Display XL — héro", className: "font-display text-[33px] font-extrabold leading-[1.06] tracking-tight" },
  { label: "Display L — succès", className: "font-display text-[26px] font-extrabold leading-[1.1] tracking-tight" },
  { label: "Titre H1 — question", className: "font-display text-2xl font-bold leading-tight" },
  { label: "Titre H2", className: "font-display text-xl font-bold" },
  { label: "Corps L", className: "text-base" },
  { label: "Corps", className: "text-[15px]" },
  { label: "Corps S", className: "text-[13.5px]" },
];

const radii = [
  { name: "sm · 10", className: "rounded-sm" },
  { name: "md · 13", className: "rounded-md" },
  { name: "lg · 15", className: "rounded-lg" },
  { name: "xl · 20", className: "rounded-xl" },
  { name: "2xl · 28", className: "rounded-2xl" },
];

export default function CataloguePage() {
  return (
    <main className="mx-auto max-w-4xl space-y-12 px-5 py-12">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Design system
        </p>
        <h1 className="font-display text-[33px] font-extrabold leading-[1.06] tracking-tight">
          Catalogue « Aube »
        </h1>
        <p className="max-w-prose text-muted-foreground">
          Référence vivante des tokens (Sprint D0). De la nuit (indigo) vers la
          lumière (corail → or). Le dégradé d&apos;aube est réservé à la
          signature et aux sceaux.
        </p>
      </header>

      <Section
        title="Couleurs sémantiques"
        subtitle="On code avec celles-ci — jamais de #hex dans un feature."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {semanticColors.map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </div>
      </Section>

      <Section
        title="Couleurs de marque"
        subtitle="Signature, sceaux, accents pédagogiques."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {brandColors.map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </div>
      </Section>

      <Section
        title="Dégradé signature"
        subtitle="« Aube » — réservé Radar & sceaux, jamais boutons/texte."
      >
        <div className="bg-dawn flex h-28 items-center justify-center rounded-2xl shadow-[var(--shadow-frame)]">
          <span className="font-display text-lg font-bold text-ink">
            --dawn
          </span>
        </div>
      </Section>

      <Section title="Typographie" subtitle="Bricolage Grotesque (display) + Inter (corps).">
        <div className="space-y-3 rounded-xl border border-border bg-card p-6">
          {typeScale.map((t) => (
            <p key={t.label} className={t.className}>
              {t.label}
            </p>
          ))}
          <p className="tabular text-base">
            Chiffres tabulaires : 0123456789 — scores &amp; compteurs.
          </p>
        </div>
      </Section>

      <Section title="Rayons">
        <div className="flex flex-wrap gap-4">
          {radii.map((r) => (
            <div key={r.name} className="space-y-1.5 text-center">
              <div
                className={`h-16 w-16 border border-border bg-secondary ${r.className}`}
                aria-hidden
              />
              <div className="text-xs text-muted-foreground">{r.name}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Ombres" subtitle="Teintées indigo, jamais noir pur.">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-card)]">
            <span className="text-sm font-medium">shadow-card</span>
          </div>
          <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-cta)]">
            <span className="text-sm font-medium">shadow-cta</span>
          </div>
          <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-frame)]">
            <span className="text-sm font-medium">shadow-frame</span>
          </div>
        </div>
      </Section>

      <div className="h-px bg-border" />

      <ComponentsShowcase />
    </main>
  );
}
