/**
 * Toast — feedback transitoire. On réexporte `sonner` (le <Toaster /> est monté
 * une fois dans AppProviders). L'enveloppe d'erreur uniforme (ARCHITECTURE
 * _FRONTEND.md §9) appellera `toast.error(error.message)`.
 */
export { toast } from "sonner";
