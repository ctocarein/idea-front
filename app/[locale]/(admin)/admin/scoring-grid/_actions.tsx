"use client";

import { useTranslations } from "next-intl";

import { Button, toast } from "@/shared/ui";

/** Publication d'une nouvelle version de grille (mock). Audité au Sprint INT. */
export function PublishGridButton() {
  const t = useTranslations("Admin.grid");
  return (
    <Button
      variant="outline"
      onClick={() => toast.success(t("toastPublished"))}
    >
      {t("publish")}
    </Button>
  );
}
