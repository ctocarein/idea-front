import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { Card, CardContent } from "@/shared/ui";
import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = { title: "Créer mon espace" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
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
  );
}
