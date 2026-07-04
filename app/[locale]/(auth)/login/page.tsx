import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { Card, CardContent, ThemeToggle } from "@/shared/ui";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "Connexion" };

/** Radar hexagonal — illustration signature du panneau gauche. */
function RadarIllustration() {
  return (
    <svg viewBox="0 0 280 280" className="w-60 h-60" aria-hidden>
      <defs>
        <linearGradient id="dawn-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff7a4d" stopOpacity="0.80" />
          <stop offset="100%" stopColor="#f4b740" stopOpacity="0.80" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hexagones concentriques */}
      <polygon points="140,10 253,75 253,205 140,270 27,205 27,75"   fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <polygon points="140,36 230,88 230,192 140,244 50,192 50,88"   fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
      <polygon points="140,62 208,101 208,179 140,218 72,179 72,101"  fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <polygon points="140,88 185,114 185,166 140,192 95,166 95,114"  fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      <polygon points="140,114 163,127 163,153 140,166 117,153 117,127" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />

      {/* Axes */}
      <line x1="140" y1="10"  x2="140" y2="270" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="27"  y1="75"  x2="253" y2="205" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="253" y1="75"  x2="27"  y2="205" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

      {/* Polygone score — dégradé aube */}
      <polygon
        points="140,36 213,98 224,189 140,212 44,195 61,95"
        fill="url(#dawn-fill)"
        stroke="#ff7a4d"
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter="url(#glow)"
      />

      {/* Points score */}
      <circle cx="140" cy="36"  r="4.5" fill="#ff7a4d" />
      <circle cx="213" cy="98"  r="4.5" fill="#f4b740" />
      <circle cx="224" cy="189" r="4.5" fill="#ff7a4d" />
      <circle cx="140" cy="212" r="4.5" fill="#f4b740" />
      <circle cx="44"  cy="195" r="4.5" fill="#ff7a4d" />
      <circle cx="61"  cy="95"  r="4.5" fill="#f4b740" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">

      {/* ─── Panneau gauche — marque ─── */}
      <div
        className="relative hidden lg:flex lg:w-[45%] flex-col justify-between overflow-hidden p-12"
        style={{ backgroundColor: "#1c1633" }}
      >
        {/* Grille blanche subtile (reprend bg-grid mais en blanc) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.055) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link
            href={routes.home}
            className="font-display text-xl font-extrabold text-white"
          >
            Ideaxion
          </Link>
        </div>

        {/* Illustration + accroche */}
        <div className="relative z-10 space-y-8">

          <div className="space-y-3">
            <h2 className="font-display text-[28px] font-extrabold leading-tight tracking-tight text-white">
              Transformez vos idées brutes en projets finançables.
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.50)" }}>
              IA · Scoring Radar · Mentors experts
            </p>
          </div>

          {/* Cartes stats */}
          {/* <div className="flex gap-3">
            <div
              className="flex-1 rounded-xl border px-5 py-4"
              style={{ backgroundColor: "rgba(42,33,71,0.85)", borderColor: "rgba(255,255,255,0.10)" }}
            >
              <div className="font-display text-2xl font-bold text-white">74%</div>
              <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                score moyen après accompagnement
              </div>
            </div>
            <div
              className="flex-1 rounded-xl border px-5 py-4"
              style={{ backgroundColor: "rgba(42,33,71,0.85)", borderColor: "rgba(255,255,255,0.10)" }}
            >
              <div className="font-display text-2xl font-bold" style={{ color: "#ff7a4d" }}>12 dim.</div>
              <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                analysées par le diagnostic IA
              </div>
            </div>
          </div> */}
        </div>

        {/* Copyright */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            © 2026 Ideaxion
          </p>
        </div>
      </div>

      {/* ─── Panneau droit — formulaire ─── */}
      <div className="flex flex-1 flex-col bg-paper bg-grid">
        {/* Mobile : logo + toggle */}
        <header className="flex h-16 items-center justify-between px-5 lg:hidden">
          <Link
            href={routes.home}
            className="font-display text-lg font-extrabold text-ink"
          >
            Ideaxion
          </Link>
          <ThemeToggle />
        </header>

        {/* Desktop : toggle seul en haut à droite */}
        <div className="hidden lg:flex justify-end p-5">
          <ThemeToggle />
        </div>

        {/* Formulaire centré */}
        <div className="flex flex-1 items-center justify-center px-5 py-8">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Content de te revoir !
              </h1>
            </div>

            <Card>
              <CardContent className="space-y-5 pt-6">
                <LoginForm />
                <p className="text-center text-sm text-muted-foreground">
                  Pas encore d&apos;espace ?{" "}
                  <Link
                    href={routes.register}
                    className="font-medium text-coral-strong hover:underline"
                  >
                    Créer mon espace
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
