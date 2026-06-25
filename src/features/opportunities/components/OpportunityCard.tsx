"use client";

import { useState, useTransition } from "react";
import { CalendarDays, CheckCircle2, Heart, Lock } from "lucide-react";

import { Badge, Button, Card, CardContent, toast } from "@/shared/ui";
import { expressInterest } from "../actions";
import type { Opportunity } from "../api";

const KIND_LABEL: Record<string, string> = {
  program: "Programme",
  contest: "Concours",
  incubator: "Incubateur",
  grant: "Subvention",
  event: "Événement",
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

export function OpportunityCard({
  opportunity,
  projectId,
}: {
  opportunity: Opportunity;
  projectId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function interested() {
    startTransition(async () => {
      const res = await expressInterest(opportunity.id, projectId);
      if (res.ok) {
        setDone(true);
        toast.success("Intérêt transmis ✦");
      } else {
        toast.error(res.message);
      }
    });
  }

  const deadline = opportunity.deadline ? dateFmt.format(new Date(opportunity.deadline)) : null;
  const kind = KIND_LABEL[opportunity.kind] ?? opportunity.kind;

  return (
    <Card className={opportunity.eligible ? "" : "opacity-90"}>
      <CardContent className="flex h-full flex-col gap-3 pt-6">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="neutral">{kind}</Badge>
          {opportunity.eligible ? (
            <Badge variant="success">Éligible</Badge>
          ) : (
            <Badge variant="outline">
              <Lock className="size-3" />
              À débloquer
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-base font-bold leading-tight">{opportunity.title}</h3>
          {opportunity.description ? (
            <p className="text-sm text-muted-foreground">{opportunity.description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {opportunity.sector ? <span>{opportunity.sector}</span> : null}
          {deadline ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {deadline}
            </span>
          ) : null}
        </div>

        {!opportunity.eligible && opportunity.missing.length > 0 ? (
          <div className="rounded-lg bg-secondary/60 p-3">
            <p className="text-xs font-semibold text-muted-foreground">Il te reste à :</p>
            <ul className="mt-1 space-y-1">
              {opportunity.missing.map((m, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-auto pt-1">
          {opportunity.eligible ? (
            done ? (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="size-4" />
                Intérêt transmis
              </span>
            ) : (
              <Button size="sm" onClick={interested} loading={pending}>
                <Heart className="size-4" />
                Ça m&apos;intéresse
              </Button>
            )
          ) : (
            <span className="text-xs text-muted-foreground">
              Renforce ton projet pour y accéder.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
