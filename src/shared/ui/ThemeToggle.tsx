"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/shared/lib/utils";

/**
 * Bascule clair/sombre. L'icône suit la classe `.dark` via CSS (pas de flag
 * `mounted`), donc aucun mismatch d'hydratation et aucun setState en effet.
 * Le thème courant est lu au clic (toujours défini à ce moment).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Changer de thème"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full text-current/80 transition-colors hover:bg-current/10",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
        className,
      )}
    >
      <Moon className="size-5 dark:hidden" />
      <Sun className="hidden size-5 dark:block" />
    </button>
  );
}
