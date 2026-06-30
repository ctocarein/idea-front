import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Target, TrendingUp, Zap, Layers } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import type { WeaknessListData } from "../actions";

const PILLAR_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  sens: { label: "Sens du projet", icon: Target, color: "text-coral-strong" },
  viabilite: { label: "Viabilité", icon: TrendingUp, color: "text-amber-500" },
  scalabilite: { label: "Scalabilité", icon: Zap, color: "text-blue-500" },
  execution: { label: "Exécution", icon: Layers, color: "text-violet-500" },
};

const PHASE_LABEL: Record<string, string> = {
  context: "En cours — Questions",
  form: "En cours — Formulaire",
  fiches: "Fiches générées",
};

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score <= 3 ? "bg-red-400" : score <= 6 ? "bg-amber-400" : "bg-success";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold tabular-nums w-8 text-right">{score}/10</span>
    </div>
  );
}

export function WeaknessCards({ data }: { data: WeaknessListData }) {
  if (!data.has_radar) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">Aucun bilan Radar disponible</p>
        <p className="text-xs text-muted-foreground mt-1">
          Complète ton diagnostic pour voir tes axes à renforcer.
        </p>
        <Link href="/dashboard/diagnostic">
          <Button className="mt-4" size="sm" variant="outline">
            Faire mon diagnostic
          </Button>
        </Link>
      </div>
    );
  }

  if (data.weaknesses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-8 text-success" />
        <p className="text-sm font-medium">Tes scores sont solides sur tous les axes.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Continue à travailler tes modules pour consolider ton projet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {data.dimensions_worked} axe{data.dimensions_worked > 1 ? "s" : ""} travaillé{data.dimensions_worked > 1 ? "s" : ""} sur 12
        </p>
        <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(data.dimensions_worked / 12) * 100}%` }}
          />
        </div>
      </div>

      {data.weaknesses.map((w) => {
        const pillar = PILLAR_CONFIG[w.pillar] ?? { label: w.pillar, icon: Target, color: "text-muted-foreground" };
        const PillarIcon = pillar.icon;
        const hasModule = !!w.module_session_id;
        const phase = w.module_phase;

        return (
          <Card key={w.dimension} className="group transition-shadow hover:shadow-sm">
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${pillar.color}`}>
                      <PillarIcon className="inline size-3 mr-1" />
                      {pillar.label}
                    </span>
                    {hasModule && phase && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        phase === "fiches"
                          ? "bg-success/15 text-success"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {PHASE_LABEL[phase] ?? phase}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-base">{w.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {w.central_question}
                  </p>
                </div>
              </div>

              <ScoreBar score={w.score} />

              <div className="flex justify-end">
                <Link href={`/dashboard/academy/module/${w.dimension}${w.module_session_id ? `?session=${w.module_session_id}` : ""}`}>
                  <Button size="sm" variant={hasModule ? "outline" : "primary"}>
                    {hasModule ? "Continuer le module" : "Travailler cet axe"}
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
