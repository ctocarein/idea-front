"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button, Modal, type ButtonProps } from "@/shared/ui";
import { DiagnosticEntry } from "./DiagnosticEntry";

/**
 * « Nouvelle idée » pour un porteur **déjà connecté**.
 *
 * Un connecté ne repasse jamais par l'entonnoir public (`/diagnostic`, le mur, l'inscription) :
 * il ajoute une idée sans quitter son espace authentifié. Le modal héberge `DiagnosticEntry`
 * en mode connecté (récit **ou** upload de document) — à la soumission, on stashe puis on pousse
 * vers la relecture (`/dashboard/ajuster`), où l'IA organise puis le porteur relit et lance son bilan.
 *
 * On pilote l'ouverture en `open`/`onOpenChange` (et non via le `trigger` asChild de Radix) :
 * `Button` n'expose pas de ref, un simple `onClick` est plus sûr.
 *
 * `children` = le contenu du bouton déclencheur (icône + libellé), fourni par chaque page appelante
 * pour conserver son style d'origine.
 */
export function NewDiagnosticModal({
  children,
  variant,
  size,
  className,
}: {
  children: React.ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const t = useTranslations("Diagnostic.newIdea");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={t("title")}
        description={t("subtitle")}
        className="max-h-[90vh] overflow-y-auto"
      >
        <DiagnosticEntry isAuthed />
      </Modal>
    </>
  );
}
