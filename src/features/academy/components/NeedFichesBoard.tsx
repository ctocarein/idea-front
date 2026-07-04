"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui";
import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import type { NeedFicheData } from "../actions";
import { NeedFicheCard } from "./NeedFicheCard";

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function NeedFichesBoard({ initial }: { initial: NeedFicheData[] }) {
  const t = useTranslations("Workshop.board");
  const tType = useTranslations("Workshop.fiche.types");
  const [fiches, setFiches] = useState(initial);
  const [type, setType] = useState<string>("all");
  const [validatedOnly, setValidatedOnly] = useState(false);

  const types = useMemo(
    () => Array.from(new Set(fiches.map((f) => f.need_type))),
    [fiches],
  );

  const filtered = useMemo(() => {
    return fiches
      .filter((f) => (type === "all" ? true : f.need_type === type))
      .filter((f) => (validatedOnly ? f.is_validated : true))
      .sort((a, b) => {
        const pa = PRIORITY_RANK[String((a.details as Record<string, unknown>)?.priority ?? "medium")] ?? 1;
        const pb = PRIORITY_RANK[String((b.details as Record<string, unknown>)?.priority ?? "medium")] ?? 1;
        return pa - pb;
      });
  }, [fiches, type, validatedOnly]);

  const validatedCount = fiches.filter((f) => f.is_validated).length;

  function handleValidated(id: string) {
    setFiches((prev) => prev.map((f) => (f.id === id ? { ...f, is_validated: true } : f)));
  }

  if (fiches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <ClipboardList className="mx-auto mb-3 size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">{t("emptyTitle")}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t("emptyText")}
        </p>
        <Link href={routes.academy}>
          <Button className="mt-4" size="sm" variant="outline">
            {t("emptyCta")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Barre de filtres */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={type === "all"} onClick={() => setType("all")}>
          {t("all", { count: fiches.length })}
        </FilterChip>
        {types.map((nt) => (
          <FilterChip key={nt} active={type === nt} onClick={() => setType(nt)}>
            {t("typeChip", {
              label: tType.has(nt) ? tType(nt) : nt,
              count: fiches.filter((f) => f.need_type === nt).length,
            })}
          </FilterChip>
        ))}
        <button
          type="button"
          onClick={() => setValidatedOnly((v) => !v)}
          className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            validatedOnly
              ? "border-success/40 bg-success/10 text-success"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="size-3.5" />
          {t("confirmedChip", { count: validatedCount })}
        </button>
      </div>

      {/* Grille de fiches */}
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("noneMatch")}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((fiche) => (
            <NeedFicheCard key={fiche.id} fiche={fiche} onValidated={handleValidated} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:border-border-strong"
      }`}
    >
      {children}
    </button>
  );
}
