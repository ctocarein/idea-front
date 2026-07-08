import { cn } from "@/shared/lib/utils";

type LogoTone = "auto" | "light" | "dark";

/**
 * Mot-symbole « Ideaxion ». `tone="auto"` (défaut) suit le thème par CSS —
 * `logo-noir` en clair, `logo-blanc` en sombre — donc aucun mismatch
 * d'hydratation (même approche que ThemeToggle). Forcer `light` / `dark` pour
 * une surface au fond fixe (ex. panneau sombre du login).
 * Hauteur pilotée par `className` (ex. `h-7`) ; largeur auto (ratio ~3.85:1).
 */
export function Logo({
  tone = "auto",
  className,
}: {
  tone?: LogoTone;
  className?: string;
}) {
  if (tone !== "auto") {
    const src = tone === "light" ? "/images/logo-blanc.svg" : "/images/logo-noir.svg";
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="Ideaxion" className={cn("w-auto", className)} />;
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-noir.svg"
        alt="Ideaxion"
        className={cn("w-auto dark:hidden", className)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-blanc.svg"
        alt=""
        aria-hidden
        className={cn("hidden w-auto dark:block", className)}
      />
    </>
  );
}
