"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, FileText } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { useSession, can } from "@/shared/auth";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Select,
  SelectItem,
  toast,
} from "@/shared/ui";
import { ComprehensionTable, RadarChart } from "@/features/scoring";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { ProjectTimeline } from "./ProjectTimeline";
import { nextStatuses } from "../lib/status-machine";
import { transitionReview } from "../actions";
import type { Project, ProjectStatus } from "../types/project.types";

const ANALYSTS = ["Mariam l'Analyste", "Admin Ideaxion"];

export function ProjectDetail({ project }: { project: Project }) {
  const t = useTranslations("Admin.projects.detail");
  const tStatus = useTranslations("Admin.projects.status");
  const user = useSession();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [assignee, setAssignee] = useState<string | null>(project.assignee);

  function changeStatus(target: ProjectStatus) {
    startTransition(async () => {
      const res = await transitionReview(project.id, target);
      if (res.ok) {
        setStatus(target);
        toast.success(t("toastStatus", { label: tStatus(target) }));
      } else {
        toast.error(res.message);
      }
    });
  }

  const canChange = can(user, "project.changeStatus");
  const canAssign = can(user, "project.assign");
  const legal = nextStatuses(status);

  const events = [
    { label: t("toastStatus", { label: tStatus(status) }), when: t("eventNow") },
    { label: t("eventDiagnostic"), when: project.createdAt },
    { label: t("eventCreated"), when: project.createdAt },
  ];

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm">
        <Link href={routes.adminProjects}>
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {project.name}
          </h1>
          <p className="text-muted-foreground">
            {project.founderName} · {project.sector}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {project.archetype === "digital" ? t("digital") : t("terrain")}
          </Badge>
          <ProjectStatusBadge status={status} />
        </div>
      </div>

      {/* Pilotage */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-display text-base font-bold">{t("steering")}</h2>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("advanceStatus")}</p>
            {canChange ? (
              legal.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {legal.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant="outline"
                      loading={pending}
                      onClick={() => changeStatus(s)}
                    >
                      → {tStatus(s)}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("noTransition")}
                </p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("noPermission")}
              </p>
            )}
          </div>

          {canAssign ? (
            <div className="max-w-xs space-y-2">
              <p className="text-sm text-muted-foreground">{t("assignedAnalyst")}</p>
              <Select
                value={assignee ?? ""}
                onValueChange={(v) => {
                  setAssignee(v);
                  toast.success(t("toastAssigned", { name: v }));
                }}
                placeholder={t("assignPlaceholder")}
              >
                {ANALYSTS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </Select>
            </div>
          ) : assignee ? (
            <p className="text-sm text-muted-foreground">
              {t("assignedTo")} <span className="font-medium">{assignee}</span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Radar + compréhension */}
      {project.score ? (
        <Card>
          <CardContent className="grid items-center gap-6 pt-6 sm:grid-cols-[auto_1fr]">
            <div className="mx-auto">
              <RadarChart score={project.score} size={240} />
            </div>
            <ComprehensionTable score={project.score} />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Documents */}
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h2 className="font-display text-base font-bold">{t("documents")}</h2>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                <FileText className="size-4" />
              </span>
              <span className="text-sm">business-plan-v1.pdf</span>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h2 className="font-display text-base font-bold">{t("history")}</h2>
            <ProjectTimeline events={events} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
