import type { IdeaExtract, ManualDiagnosticPayload } from "../api/actions";

/**
 * Diagnostic anonyme en attente d'inscription. Un visiteur raconte son idée sans compte ;
 * on stashe **le récit organisé** (payload + les 12 dimensions rédigées par l'IA) et on le
 * rejoue dès qu'il a créé son espace → son projet pré-écrit l'attend, prêt à être relu.
 *
 * L'édition dimension par dimension ne se fait plus en anonyme : c'est le cœur de valeur,
 * elle vit derrière l'inscription (wizard `/dashboard/ajuster`).
 *
 * Stocké en localStorage (client-only) : pas de donnée perso dans les requêtes, et le
 * claim s'exécute côté navigateur après l'authentification.
 */
const KEY = "idx_pending_diagnostic";

/** Ce qu'on garde entre le récit anonyme et le premier écran post-inscription. */
export interface PendingDiagnostic {
  payload: ManualDiagnosticPayload;
  /** Les 12 dimensions telles que l'IA les a rédigées — matière du wizard de relecture. */
  extract: IdeaExtract | null;
}

/** Ancien format (payload nu) — encore possible dans un navigateur qui n'a pas rechargé. */
type StoredShape = PendingDiagnostic | ManualDiagnosticPayload;

function isLegacy(raw: StoredShape): raw is ManualDiagnosticPayload {
  return !("payload" in raw);
}

export function savePendingDiagnostic(
  payload: ManualDiagnosticPayload,
  extract: IdeaExtract | null = null,
): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ payload, extract } satisfies PendingDiagnostic));
  } catch {
    // localStorage indisponible (mode privé strict) → on ignore, le gate reste fonctionnel.
  }
}

export function loadPendingDiagnostic(): PendingDiagnostic | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredShape;
    // Rétrocompat : un stash d'avant le wizard n'a pas d'extract → relecture impossible,
    // on le rejoue tel quel.
    return isLegacy(parsed) ? { payload: parsed, extract: null } : parsed;
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
