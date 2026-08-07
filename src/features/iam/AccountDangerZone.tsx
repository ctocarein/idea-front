"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Download, Trash2 } from "lucide-react";

import { Button, Card, CardContent, Modal, toast } from "@/shared/ui";

import { deleteMyAccount } from "./gdprActions";

/**
 * Zone RGPD du profil — portabilité (export JSON) et droit à l'oubli (suppression).
 * L'export passe par le route handler `/api/me/export` (téléchargement navigateur).
 * La suppression est confirmée via une modale, puis exécutée par la server action
 * (qui purge la session et redirige) — d'où l'absence de `router.push` ici.
 */
export function AccountDangerZone() {
  const t = useTranslations("Profile.account");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      // deleteMyAccount redirige en cas de succès ; on ne récupère un retour qu'en cas d'échec.
      const result = await deleteMyAccount();
      if (result && !result.ok) {
        toast.error(result.message ?? t("deleteError"));
        setConfirmOpen(false);
      }
    });
  }

  return (
    <Card className="border-destructive/30">
      <CardContent className="space-y-6 pt-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("title")}
        </h2>

        {/* Export RGPD */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{t("exportTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("exportDescription")}</p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <a href="/api/me/export" download>
              <Download className="mr-1.5 size-4" />
              {t("exportButton")}
            </a>
          </Button>
        </div>

        <div className="h-px bg-border" />

        {/* Suppression du compte */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-destructive">{t("deleteTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("deleteDescription")}</p>
          </div>
          <Button
            variant="danger"
            className="shrink-0"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="mr-1.5 size-4" />
            {t("deleteButton")}
          </Button>
        </div>
      </CardContent>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDescription")}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isPending}
            >
              {t("deleteConfirmCancel")}
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isPending}>
              {isPending ? t("deleting") : t("deleteConfirmConfirm")}
            </Button>
          </>
        }
      />
    </Card>
  );
}
