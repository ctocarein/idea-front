import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button, Card, CardContent } from "@/shared/ui";
import { routes } from "@/shared/config/routes";
import { verifyEmail } from "@/features/auth";

export const metadata: Metadata = { title: "Vérification de l'email" };
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const res = token ? await verifyEmail(token) : { ok: false };

  return (
    <Card className="mx-auto mt-16 w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        {res.ok ? (
          <>
            <CheckCircle2 className="size-12 text-emerald-500" />
            <h1 className="font-display text-xl font-bold tracking-tight">Adresse confirmée</h1>
            <p className="max-w-xs text-sm text-muted-foreground">
              Merci — ton email est vérifié et ton espace est sécurisé.
            </p>
            <Button asChild className="mt-2">
              <Link href={routes.dashboard}>Aller à mon espace</Link>
            </Button>
          </>
        ) : (
          <>
            <XCircle className="size-12 text-muted-foreground" />
            <h1 className="font-display text-xl font-bold tracking-tight">Lien invalide ou expiré</h1>
            <p className="max-w-xs text-sm text-muted-foreground">
              Le lien a peut-être expiré (24 h). Depuis ton espace, tu peux t&apos;en renvoyer un.
            </p>
            <Button asChild variant="outline" className="mt-2">
              <Link href={routes.dashboard}>Mon espace</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
