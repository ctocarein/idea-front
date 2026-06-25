"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

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
import { STATUS_LABEL, nextStatuses } from "../lib/status-machine";
import { transitionReview } from "../actions";
import type { Project, ProjectStatus } from "../types/project.types";

const ANALYSTS = ["Mariam l'Analyste", "Admin Ideaxion"];

export function ProjectDetail({ project }: { project: Project }) {
  const user = useSession();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [assignee, setAssignee] = useState<string | null>(project.assignee);

  function changeStatus(target: ProjectStatus) {
    startTransition(async () => {
      const res = await transitionReview(project.id, target);
      if (res.ok) {
        setStatus(target);
        toast.success(`Statut : ${STATUS_LABEL[target]}`);
      } else {
        toast.error(res.message);
      }
    });
  }

  const canChange = can(user, "project.changeStatus");
  const canAssign = can(user, "project.assign");
  const legal = nextStatuses(status);

  const events = [
    { label: `Statut : ${STATUS_LABEL[status]}`, when: "maintenant" },
    { label: "Diagnostic généré", when: project.createdAt },
    { label: "Projet créé", when: project.createdAt },
  ];

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm">
        <Link href={routes.adminProjects}>
          <ArrowLeft className="size-4" />
          Projets
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
            {project.archetype === "digital" ? "Digital" : "Terrain"}
          </Badge>
          <ProjectStatusBadge status={status} />
        </div>
      </div>

      {/* Pilotage */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-display text-base font-bold">Pilotage</h2>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Faire avancer le statut</p>
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
                      → {STATUS_LABEL[s]}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune transition disponible depuis ce statut.
                </p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                Ton rôle ne permet pas de changer le statut.
              </p>
            )}
          </div>

          {canAssign ? (
            <div className="max-w-xs space-y-2">
              <p className="text-sm text-muted-foreground">Analyste assigné</p>
              <Select
                value={assignee ?? ""}
                onValueChange={(v) => {
                  setAssignee(v);
                  toast.success(`Assigné à ${v}`);
                }}
                placeholder="Assigner…"
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
              Assigné à <span className="font-medium">{assignee}</span>
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
            <h2 className="font-display text-base font-bold">Documents</h2>
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
            <h2 className="font-display text-base font-bold">Historique</h2>
            <ProjectTimeline events={events} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
