"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

import { Button, toast } from "@/shared/ui";

/**
 * Expression d'intérêt pour la Phase Pro (signal d'instrumentation, pas un
 * achat). La Phase Pro elle-même est v2 ; ici on capte l'intention.
 */
export function ExpressInterest() {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant={done ? "outline" : "primary"}
      disabled={done}
      onClick={() => {
        setDone(true);
        toast.success("Noté — on te recontactera quand l'accompagnement ouvrira.");
      }}
    >
      <Heart className="size-5" />
      {done ? "Intérêt enregistré" : "Ça m'intéresse"}
    </Button>
  );
}
