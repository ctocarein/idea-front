import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { Card, CardContent, ThemeToggle } from "@/shared/ui";
import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = { title: "Créer mon espace" };

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col bg-paper bg-grid">
      <header className="flex h-16 items-center justify-between px-5">
        <Link
          href={routes.home}
          className="font-display text-lg font-extrabold text-ink"
        >
          Ideaxion
        </Link>
        <ThemeToggle />
      </header>

      <main
        id="main-content"
        className="flex flex-1 items-center justify-center px-5 py-10"
      >
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              On part d&apos;où tu es.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gratuit, sans pression.
            </p>
          </div>

          <Card>
            <CardContent className="space-y-5 pt-6">
              <RegisterForm />
              <p className="text-center text-sm text-muted-foreground">
                Tu as déjà un espace ?{" "}
                <Link
                  href={routes.login}
                  className="font-medium text-coral-strong hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
