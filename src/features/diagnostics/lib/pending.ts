import type { ManualDiagnosticPayload } from "../api/actions";

/**
 * Diagnostic anonyme en attente d'inscription. Un visiteur peut faire son diagnostic
 * guidé sans compte ; on stashe son payload localement, et on le **rejoue** contre le
 * vrai pipeline (`POST /diagnostics`) dès qu'il a créé son espace → son bilan l'attend.
 *
 * Stocké en localStorage (client-only) : pas de donnée perso dans les requêtes, et le
 * claim s'exécute côté navigateur après l'authentification.
 */
const KEY = "idx_pending_diagnostic";

export function savePendingDiagnostic(payload: ManualDiagnosticPayload): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // localStorage indisponible (mode privé strict) → on ignore, le gate reste fonctionnel.
  }
}

export function loadPendingDiagnostic(): ManualDiagnosticPayload | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ManualDiagnosticPayload) : null;
  } catch {
    return null;
  }
}

export function clearPendingDiagnostic(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // idem
  }
}
