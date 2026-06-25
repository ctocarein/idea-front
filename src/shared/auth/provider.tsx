"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Session } from "./session";

/**
 * Contexte de session côté client, alimenté par le layout serveur de chaque
 * espace authentifié (qui lit le cookie via getSession). Les Client Components
 * y lisent l'utilisateur courant pour l'UX (RBAC cosmétique, affichage).
 */
const SessionContext = createContext<Session | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: Session | null;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): Session | null {
  return useContext(SessionContext);
}
