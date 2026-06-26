"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";

import { getQueryClient } from "@/shared/api/query-client";

/**
 * Providers globaux (CHARTE_FRONTEND.md §3, ARCHITECTURE_FRONTEND.md §7).
 * Monté une seule fois dans le RootLayout.
 *
 * - React Query : état serveur (cache/invalidation).
 * - next-themes : thème clair/sombre par classe (tokens « Aube »).
 * - framer-motion : `reducedMotion="user"` → respecte prefers-reduced-motion.
 * - sonner : toasts (enveloppe d'erreur uniforme côté UI).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  // useState garantit un client stable entre les re-renders (pas de recréation).
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <MotionConfig reducedMotion="user">
          {children}
          <Toaster richColors position="top-center" />
        </MotionConfig>
      </ThemeProvider>
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
