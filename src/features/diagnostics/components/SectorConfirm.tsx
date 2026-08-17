"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Pencil } from "lucide-react";

import { Button } from "@/shared/ui";
import {
  SECTOR_HINTS,
  SECTOR_KEYS,
  SECTOR_LABELS,
  type SectorKey,
} from "../data/sectors";
import type { SectorProposal } from "../api/actions";

/**
 * « C'est bien ton secteur ? » — la seule question qu'on pose avant la relecture.
 *
 * Le porteur ne remplit pas un sélecteur de 14 entrées : l'extraction a déduit un secteur
 * de son récit, il **confirme** ou corrige. Trois options d'abord (la proposition + ses deux
 * replis), la liste complète seulement s'il la demande — un porteur qui hésite devant treize
 * cases choisit « autre », et un projet « autre » n'est comparable à aucune population.
 *
 * C'est le seul moment du parcours où l'on demande cette information : elle conditionne la
 * pondération du score ET l'appartenance au corpus de comparaison.
 */
export function SectorConfirm({
  proposal,
  onConfirm,
}: {
  /** Absent si l'extraction n'a rien proposé → on part de `autre`, liste ouverte d'emblée. */
  proposal?: SectorProposal | null;
  onConfirm: (sector: SectorKey) => void;
}) {
  const t = useTranslations("Diagnostic.sector");
  const proposed: SectorKey = proposal?.sector ?? "autre";
  const [selected, setSelected] = useState<SectorKey>(proposed);
  // Liste complète d'emblée quand on n'a rien de crédible à proposer.
  const [showAll, setShowAll] = useState(!proposal || proposed === "autre");

  // Proposition d'abord, puis ses replis. Dédupliqué, `autre` toujours atteignable.
  const shortlist: SectorKey[] = [
    proposed,
    ...(proposal?.candidates ?? []).filter((key) => key !== proposed),
  ];
  const options = showAll ? [...SECTOR_KEYS] : shortlist;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">
          {proposal && proposed !== "autre" ? t("subtitleProposed") : t("subtitleUnknown")}
        </p>
      </div>

      <ul className="space-y-2" role="radiogroup" aria-label={t("title")}>
        {options.map((key) => {
          const active = selected === key;
          return (
            <li key={key}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(key)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  active
                    ? "border-coral-strong/40 bg-coral/5"
                    : "border-border hover:border-border-strong hover:bg-secondary/40"
                }`}
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    active ? "border-coral-strong bg-coral-strong text-white" : "border-border"
                  }`}
                >
                  {active && <Check className="size-3" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{SECTOR_LABELS[key]}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {SECTOR_HINTS[key]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {!showAll && (
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => setShowAll(true)}>
          <Pencil className="size-3.5" />
          {t("seeAll")}
        </Button>
      )}

      <Button className="w-full" onClick={() => onConfirm(selected)}>
        {t("confirm")}
        <ArrowRight className="size-5" />
      </Button>
    </div>
  );
}
