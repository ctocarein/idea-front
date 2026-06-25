import type { Metadata } from "next";
import Link from "next/link";
import { ShieldX } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";

export const metadata: Metadata = { title: "Accès refusé" };

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-5 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/12 text-destructive">
        <ShieldX className="size-7" />
      </span>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Cet espace ne t&apos;est pas ouvert.
      </h1>
      <p className="max-w-sm text-muted-foreground">
        Ton rôle ne donne pas accès à cette page. Si c&apos;est une erreur,
        reconnecte-toi.
      </p>
      <div className="mt-2 flex gap-3">
        <Button asChild variant="ghost">
          <Link href={routes.home}>Accueil</Link>
        </Button>
        <Button asChild>
          <Link href={routes.login}>Se reconnecter</Link>
        </Button>
      </div>
    </main>
  );
}
