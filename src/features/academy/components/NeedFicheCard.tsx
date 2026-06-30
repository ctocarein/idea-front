"use client";

import { useState, useTransition } from "react";
import { Code2, Users, Handshake, Wrench, DollarSign, GraduationCap, CheckCircle2, Circle, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { toast } from "@/shared/ui";
import type { NeedFicheData } from "../actions";
import { validateFiche } from "../actions";

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  dev: { label: "Développeur", icon: Code2, color: "text-blue-500 bg-blue-50" },
  expert: { label: "Expert", icon: Lightbulb, color: "text-amber-500 bg-amber-50" },
  cofondateur: { label: "Cofondateur", icon: Users, color: "text-violet-500 bg-violet-50" },
  partenaire: { label: "Partenaire", icon: Handshake, color: "text-teal-500 bg-teal-50" },
  outil: { label: "Outil", icon: Wrench, color: "text-slate-500 bg-slate-50" },
  financement: { label: "Financement", icon: DollarSign, color: "text-green-500 bg-green-50" },
  formation: { label: "Formation", icon: GraduationCap, color: "text-orange-500 bg-orange-50" },
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "Priorité haute",
  medium: "Priorité moyenne",
  low: "Priorité basse",
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-slate-100 text-slate-500",
};

export function NeedFicheCard({
  fiche,
  onValidated,
}: {
  fiche: NeedFicheData;
  onValidated?: (id: string) => void;
}) {
  const [validated, setValidated] = useState(fiche.is_validated);
  const [isPending, startTransition] = useTransition();

  const config = TYPE_CONFIG[fiche.need_type] ?? { label: fiche.need_type, icon: Lightbulb, color: "text-muted-foreground bg-muted" };
  const Icon = config.icon;
  const details = fiche.details as Record<string, string | string[]>;
  const priority = (details.priority as string) ?? "medium";
  const skills = Array.isArray(details.skills) ? details.skills : [];
  const deliverables = Array.isArray(details.deliverables) ? details.deliverables : [];

  function handleValidate() {
    startTransition(async () => {
      const result = await validateFiche(fiche.id);
      if (result.ok) {
        setValidated(true);
        onValidated?.(fiche.id);
        toast.success("Fiche confirmée.");
      }
    });
  }

  return (
    <Card className={validated ? "border-success/40 bg-success/5" : undefined}>
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-start gap-3">
          <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
            <Icon className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {config.label}
              </span>
              {priority && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLOR[priority] ?? PRIORITY_COLOR.medium}`}>
                  {PRIORITY_LABEL[priority] ?? priority}
                </span>
              )}
              {validated && (
                <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                  <CheckCircle2 className="size-3" /> Confirmée
                </span>
              )}
            </div>
            <h3 className="mt-1 font-semibold leading-snug">{fiche.title}</h3>
          </div>
        </div>

        {fiche.description && (
          <p className="text-sm text-muted-foreground">{fiche.description}</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {details.profile && (
            <Detail label="Profil recherché" value={details.profile as string} />
          )}
          {details.budget && (
            <Detail label="Budget estimatif" value={details.budget as string} />
          )}
          {details.timeline && (
            <Detail label="Délai souhaité" value={details.timeline as string} />
          )}
          {details.engagement_type && (
            <Detail label="Type d'engagement" value={details.engagement_type as string} />
          )}
        </div>

        {skills.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Compétences attendues
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span key={i} className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {deliverables.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Livrables attendus
            </p>
            <ul className="space-y-1">
              {deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Circle className="mt-1 size-2 shrink-0 fill-muted-foreground text-muted-foreground" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!validated && (
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={handleValidate} disabled={isPending}>
              <CheckCircle2 className="mr-1.5 size-3.5" />
              {isPending ? "Confirmation…" : "Confirmer ce besoin"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}
