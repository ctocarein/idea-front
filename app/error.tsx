"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

import { Button } from "@/shared/ui";

/**
 * Error boundary global (ARCHITECTURE_FRONTEND.md §9). Jamais d'écran blanc :
 * un message clair + un bouton « réessayer ».
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Au Sprint INT/OPS : remonter à Sentry.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-5 py-24 text-center">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Quelque chose a coincé.
      </h1>
      <p className="max-w-sm text-muted-foreground">
        Ce n&apos;est pas toi, c&apos;est nous. Réessaie dans un instant.
      </p>
      <Button onClick={reset} className="mt-2">
        <RotateCw className="size-5" />
        Réessayer
      </Button>
    </main>
  );
}
