"use client";

import { Button, toast } from "@/shared/ui";

/** Publication d'une nouvelle version de grille (mock). Audité au Sprint INT. */
export function PublishGridButton() {
  return (
    <Button
      variant="outline"
      onClick={() => toast.success("Nouvelle version de grille préparée")}
    >
      Publier une nouvelle version
    </Button>
  );
}
