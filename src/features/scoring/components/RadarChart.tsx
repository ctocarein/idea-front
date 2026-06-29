"use client";

import { useId } from "react";
import { motion } from "framer-motion";

import { cn } from "@/shared/lib/utils";
import { AXES, SCALE_MAX, type RadarScore } from "../types/scoring.types";

/**
 * RadarChart — la signature d'Ideaxion (CHARTE §1.1, §2.3) : le Radar de Collision.
 * 12 dimensions (/10), tracé au chargement, rempli du dégradé d'aube (seul endroit
 * autorisé avec les sceaux). Vue experte (admin/mentor) — le porteur voit plutôt la
 * ComprehensionTable.
 */
export interface RadarChartProps {
  score: RadarScore;
  size?: number;
  showLabels?: boolean;
  /** Second score (ex. « après ») superposé en pointillés pour l'avant/après. */
  compare?: RadarScore;
  className?: string;
}

const ANGLE = (Math.PI * 2) / AXES.length;
const START = -Math.PI / 2; // premier axe en haut

// Arrondi 2 décimales : coordonnées déterministes → pas de mismatch d'hydratation
// (cos/sin produisent des epsilons différents entre Node et le navigateur).
const round = (n: number) => Math.round(n * 100) / 100;

function point(cx: number, cy: number, r: number, i: number, ratio: number) {
  const a = START + i * ANGLE;
  return [round(cx + r * ratio * Math.cos(a)), round(cy + r * ratio * Math.sin(a))] as const;
}

function polygon(cx: number, cy: number, r: number, values: number[]) {
  return values
    .map((v, i) => point(cx, cy, r, i, v / SCALE_MAX).join(","))
    .join(" ");
}

export function RadarChart({
  score,
  size = 280,
  showLabels = true,
  compare,
  className,
}: RadarChartProps) {
  const gradientId = useId();
  const cx = size / 2;
  const cy = size / 2;
  const r = size * (showLabels ? 0.33 : 0.42);
  // Marge horizontale pour que les libellés des 12 axes ne soient pas rognés.
  const pad = showLabels ? Math.round(size * 0.16) : 0;

  const values = AXES.map((a) => score.axes[a.key] ?? 0);
  const dataPoints = polygon(cx, cy, r, values);
  const comparePoints = compare
    ? polygon(
        cx,
        cy,
        r,
        AXES.map((a) => compare.axes[a.key] ?? 0),
      )
    : null;

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`${-pad} 0 ${size + pad * 2} ${size}`}
      width={size + pad * 2}
      height={size}
      role="img"
      aria-label="Radar de Collision — 12 dimensions d'évaluation"
      className={cn("max-w-full h-auto", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--coral)" />
          <stop offset="100%" stopColor="var(--gold)" />
        </linearGradient>
      </defs>

      {/* Grille concentrique */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={polygon(
            cx,
            cy,
            r,
            AXES.map(() => ring * SCALE_MAX),
          )}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}

      {/* Rayons */}
      {AXES.map((axis, i) => {
        const [x, y] = point(cx, cy, r, i, 1);
        return (
          <line
            key={axis.key}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--border)"
            strokeWidth={1}
          />
        );
      })}

      {/* Score de comparaison (avant/après) — pointillés discrets */}
      {comparePoints ? (
        <polygon
          points={comparePoints}
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      ) : null}

      {/* Remplissage signature (dégradé d'aube) */}
      <motion.polygon
        points={dataPoints}
        fill={`url(#${gradientId})`}
        fillOpacity={0.4}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
      />
      {/* Tracé du polygone au chargement */}
      <motion.polygon
        points={dataPoints}
        fill="none"
        stroke="var(--coral)"
        strokeWidth={2}
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
      />

      {/* Points de données */}
      {values.map((v, i) => {
        const [x, y] = point(cx, cy, r, i, v / SCALE_MAX);
        return <circle key={AXES[i].key} cx={x} cy={y} r={3} fill="var(--coral-strong)" />;
      })}

      {/* Libellés d'axes */}
      {showLabels
        ? AXES.map((axis, i) => {
            const [x, y] = point(cx, cy, r, i, 1.2);
            const anchor =
              Math.abs(x - cx) < 4 ? "middle" : x > cx ? "start" : "end";
            return (
              <text
                key={axis.key}
                x={x}
                y={y}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="fill-muted-foreground text-[10px] font-medium"
              >
                {axis.short}
              </text>
            );
          })
        : null}
    </svg>
  );
}
