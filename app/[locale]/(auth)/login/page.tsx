import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { routes } from "@/shared/config/routes";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, Logo, ThemeToggle } from "@/shared/ui";
import { LoginForm, OAuthButtons } from "@/features/auth";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  const t = useTranslations("Auth");
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
          <Link href={routes.home} aria-label="Ideaxion — accueil">
            <Logo tone="light" className="h-8" />
          </Link>
        </div>

        {/* Illustration + accroche */}
        <div className="relative z-10 space-y-8">

          <div className="space-y-3">
            <h2 className="font-display text-[28px] font-extrabold leading-tight tracking-tight text-white">
              {t("login.brandTagline")}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.50)" }}>
              {t("login.brandSub")}
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
          <Link href={routes.home} aria-label="Ideaxion — accueil">
            <Logo className="h-7" />
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
                {t("login.welcome")}
              </h1>
            </div>

            <Card>
              <CardContent className="space-y-5 pt-6">
                <OAuthButtons />
                <LoginForm />
                <p className="text-center text-sm text-muted-foreground">
                  {t("login.noAccount")}{" "}
                  <Link
                    href={routes.register}
                    className="font-medium text-coral-strong hover:underline"
                  >
                    {t("login.createAccount")}
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
