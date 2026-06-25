import Link from "next/link";
import { Compass } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-5 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Compass className="size-7" />
      </span>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        On ne trouve pas cette page.
      </h1>
      <p className="max-w-sm text-muted-foreground">
        Le lien a peut-être changé. Reviens en terrain connu.
      </p>
      <Button asChild className="mt-2">
        <Link href={routes.home}>Retour à l&apos;accueil</Link>
      </Button>
    </main>
  );
}
