import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { Card, CardContent } from "@/shared/ui";
import { DemoRoleSwitcher, LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Content de te revoir.
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Retrouve ton espace.
        </p>
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
          <div className="border-t border-border pt-4">
            <DemoRoleSwitcher />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
