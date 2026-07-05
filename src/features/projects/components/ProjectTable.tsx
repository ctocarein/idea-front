"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { routes } from "@/shared/config/routes";
import { Chip, DataTable, type Column } from "@/shared/ui";
import { overallScore } from "@/features/scoring";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { ALL_STATUSES } from "../data/mock";
import type { Project } from "../types/project.types";

export function ProjectTable({ projects }: { projects: Project[] }) {
  const t = useTranslations("Admin.projects");
  const router = useRouter();
  const [sector, setSector] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (!sector || p.sector === sector) && (!status || p.status === status),
      ),
    [projects, sector, status],
  );

  // Secteurs dérivés des projets présents (fonctionne pour le mock comme pour le réel).
  const sectors = useMemo(
    () => [...new Set(projects.map((p) => p.sector))].sort(),
    [projects],
  );

  const columns: Column<Project>[] = [
    {
      key: "name",
      header: t("cols.project"),
      sortable: true,
      sortValue: (p) => p.name,
      cell: (p) => (
        <div>
          <div className="font-medium">{p.name}</div>
          <div className="text-xs text-muted-foreground">{p.founderName}</div>
        </div>
      ),
    },
    {
      key: "sector",
      header: t("cols.sector"),
      sortable: true,
      sortValue: (p) => p.sector,
    },
    {
      key: "status",
      header: t("cols.status"),
      sortable: true,
      sortValue: (p) => p.status,
      cell: (p) => <ProjectStatusBadge status={p.status} />,
    },
    {
      key: "score",
      header: t("cols.score"),
      sortable: true,
      sortValue: (p) => (p.score ? overallScore(p.score) : -1),
      cell: (p) => (
        <span className="tabular">{p.score ? overallScore(p.score) : "—"}</span>
      ),
    },
    {
      key: "createdAt",
      header: t("cols.createdAt"),
      sortValue: (p) => p.createdAt,
      className: "hidden sm:table-cell",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip selected={sector === null} onClick={() => setSector(null)}>
          {t("allSectors")}
        </Chip>
        {sectors.map((s) => (
          <Chip
            key={s}
            selected={sector === s}
            onClick={() => setSector((cur) => (cur === s ? null : s))}
          >
            {s}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Chip selected={status === null} onClick={() => setStatus(null)}>
          {t("allStatuses")}
        </Chip>
        {ALL_STATUSES.map((s) => (
          <Chip
            key={s}
            selected={status === s}
            onClick={() => setStatus((cur) => (cur === s ? null : s))}
          >
            {t(`status.${s}`)}
          </Chip>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        getRowKey={(p) => p.id}
        searchable
        searchPlaceholder={t("search")}
        onRowClick={(p) => router.push(routes.adminProject(p.id))}
      />
    </div>
  );
}
