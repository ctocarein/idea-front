"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Input } from "./Input";

/**
 * DataTable — table générique sans métier (CHARTE_FRONTEND.md §2.2) :
 * tri, pagination et recherche côté client. Le mapping métier (libellés,
 * badges de statut) est fourni par le feature via `columns[].cell`.
 *
 * Pour de gros volumes, le tri/pagination passeront côté serveur au Sprint INT
 * (on remplacera la logique client par des params d'API).
 */
export interface Column<T> {
  key: string;
  header: string;
  /** Rendu de la cellule (sinon valeur brute via sortValue). */
  cell?: (row: T) => React.ReactNode;
  /** Valeur utilisée pour trier (et rechercher si searchable). */
  sortValue?: (row: T) => string | number;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  /** Rendu quand `data` (filtré) est vide. */
  empty?: React.ReactNode;
  className?: string;
}

type SortDir = "asc" | "desc";

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  pageSize = 10,
  searchable = false,
  searchPlaceholder = "Rechercher…",
  onRowClick,
  empty,
  className,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      columns.some((c) =>
        String(c.sortValue?.(row) ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, columns, query, searchable]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [filtered, columns, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const rows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  function toggleSort(col: Column<T>) {
    if (!col.sortable || !col.sortValue) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
    setPage(0);
  }

  return (
    <div className={cn("space-y-3", className)}>
      {searchable ? (
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
            aria-label="Rechercher dans le tableau"
          />
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      "px-4 py-3 font-medium text-muted-foreground",
                      col.className,
                    )}
                  >
                    {col.sortable && col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        className="inline-flex items-center gap-1.5 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        aria-label={`Trier par ${col.header}`}
                      >
                        {col.header}
                        {!isSorted ? (
                          <ChevronsUpDown className="size-3.5 opacity-60" />
                        ) : sortDir === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center">
                  {empty ?? (
                    <span className="text-sm text-muted-foreground">
                      Aucun résultat.
                    </span>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border last:border-0",
                    onRowClick &&
                      "cursor-pointer transition-colors hover:bg-secondary/40",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3 align-middle", col.className)}
                    >
                      {col.cell
                        ? col.cell(row)
                        : String(col.sortValue?.(row) ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {sorted.length} résultat{sorted.length > 1 ? "s" : ""} · page{" "}
            {safePage + 1}/{pageCount}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
            >
              Suivant
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
