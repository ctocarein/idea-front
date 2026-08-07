/** Feature diagnostics — 2 flows (idée guidée + upload) → bilan. Barrel. */
export { DiagnosticEntry } from "./components/DiagnosticEntry";
export { DiagnosticResult } from "./components/DiagnosticResult";
export { ClaimPendingDiagnostic } from "./components/ClaimPendingDiagnostic";
export { AdjustProjectClient } from "./components/AdjustProjectClient";
export {
  DimensionWizard,
  type WizardResult,
  type DimensionVerdict,
} from "./components/DimensionWizard";
export { loadPendingDiagnostic, savePendingDiagnostic, clearPendingDiagnostic } from "./lib/pending";
export type { PendingDiagnostic } from "./lib/pending";
export { CATEGORIES, getCategory, type Category } from "./data/categories";
export {
  manualDiagnosticSchema,
  type ManualDiagnosticInput,
} from "./schemas/manual-diagnostic.schema";
