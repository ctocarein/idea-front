import { Spinner } from "@/shared/ui";

/** Fallback de chargement global (Suspense). Jamais d'écran blanc. */
export default function Loading() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center py-24">
      <Spinner className="size-7 text-coral-strong" />
    </div>
  );
}
