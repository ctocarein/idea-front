import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

/**
 * Configuration React Query (ARCHITECTURE_FRONTEND.md §6.2).
 * L'état serveur vit ici (cache, invalidation, refetch) ; jamais de store global.
 *
 * Resilience front (§9) : on ne rejoue PAS les 4xx métier (un 422 ne se retente
 * pas). Le retry réseau ne vaut que pour les erreurs transitoires (5xx / réseau).
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
          const status = (error as { status?: number })?.status;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
      dehydrate: {
        // Permet de déshydrater aussi les requêtes encore en attente (RSC streaming).
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Côté serveur : un client neuf par requête.
 * Côté navigateur : un singleton (évite de recréer le cache à chaque render).
 */
export function getQueryClient() {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
