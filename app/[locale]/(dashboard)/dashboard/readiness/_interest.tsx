"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";

import { Button, toast } from "@/shared/ui";

/**
 * Expression d'intérêt pour la Phase Pro (signal d'instrumentation, pas un
 * achat). La Phase Pro elle-même est v2 ; ici on capte l'intention.
 */
export function ExpressInterest() {
  const t = useTranslations("Readiness");
  const [done, setDone] = useState(false);
  return (
    <Button
      variant={done ? "outline" : "primary"}
      disabled={done}
      onClick={() => {
        setDone(true);
        toast.success(t("interestToast"));
      }}
    >
      <Heart className="size-5" />
      {done ? t("interestDone") : t("interestCta")}
    </Button>
  );
}
