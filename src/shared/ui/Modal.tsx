"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

/**
 * Modal — dialogue accessible (Radix : focus trap, aria, Échap, clic dehors).
 * Mobile-first : la feuille occupe la largeur sur petit écran, centrée au-delà.
 *
 * Usage :
 *   <Modal open={open} onOpenChange={setOpen} title="…" description="…">
 *     …contenu…
 *   </Modal>
 */
export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Déclencheur optionnel (sinon piloter via open/onOpenChange). */
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4",
            "rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-frame)]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            className,
          )}
        >
          <div className="space-y-1.5">
            <Dialog.Title className="font-display text-xl font-bold tracking-tight">
              {title}
            </Dialog.Title>
            {description ? (
              <Dialog.Description className="text-sm text-muted-foreground">
                {description}
              </Dialog.Description>
            ) : null}
          </div>

          {children}

          {footer ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {footer}
            </div>
          ) : null}

          <Dialog.Close
            aria-label="Fermer"
            className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
          >
            <X className="size-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Ré-exports pour les cas avancés (composer un Dialog sur mesure). */
export const ModalClose = Dialog.Close;
export const ModalTrigger = Dialog.Trigger;
