import { cn } from "@/shared/lib/utils";

/**
 * RadarHex — l'hexagone signature en ornement (sceaux, héros, états vides).
 * Décoratif : dégradé d'aube autorisé. `aria-hidden`.
 */
export function RadarHex({
  className,
  filled = true,
}: {
  className?: string;
  filled?: boolean;
}) {
  // Hexagone régulier pointe en haut, dans un viewBox 100x100.
  const points = Array.from({ length: 6 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    return [50 + 46 * Math.cos(a), 50 + 46 * Math.sin(a)].join(",");
  }).join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id="radarhex-dawn" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--coral)" />
          <stop offset="100%" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <polygon
        points={points}
        fill={filled ? "url(#radarhex-dawn)" : "none"}
        fillOpacity={filled ? 0.15 : 0}
        stroke="url(#radarhex-dawn)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}
