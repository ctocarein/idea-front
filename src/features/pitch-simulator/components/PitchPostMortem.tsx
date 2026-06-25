import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Quote, RefreshCw } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Badge, Button, Card, CardContent } from "@/shared/ui";
import type { PostMortem } from "../api";

/** Accès défensif (le post-mortem est typé `unknown` côté OpenAPI). */
const str = (o: unknown, ...keys: string[]): string => {
  if (typeof o === "string") return o;
  if (o && typeof o === "object") {
    for (const k of keys) {
      const v = (o as Record<string, unknown>)[k];
      if (typeof v === "string" && v) return v;
      if (typeof v === "number") return String(v);
    }
  }
  return "";
};
const num = (o: unknown, ...keys: string[]): number | null => {
  if (o && typeof o === "object") {
    for (const k of keys) {
      const v = (o as Record<string, unknown>)[k];
      if (typeof v === "number") return v;
    }
  }
  return null;
};

const VOTE_BADGE: Record<string, "success" | "warning" | "neutral"> = {
  go: "success",
  oui: "success",
  conditional: "warning",
  nogo: "neutral",
  non: "neutral",
};

export function PitchPostMortem({
  report,
  sessionId,
}: {
  report: PostMortem | null;
  sessionId: string;
}) {
  if (!report) {
    return (
      <Card>
        <CardContent className="space-y-3 py-10 text-center">
          <h2 className="font-display text-xl font-bold">Le post-mortem se prépare</h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            La délibération du comité n&apos;est pas encore disponible.
          </p>
          <Button asChild variant="outline">
            <Link href={routes.pitchSimSession(sessionId)}>
              <RefreshCw className="size-4" />
              Rafraîchir
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const overall = num(report.scores, "overall_global", "overall", "global");
  const fond = num(report.scores, "overall_fond", "fond");
  const forme = num(report.scores, "overall_forme", "forme");
  const radar = report.radar ?? [];
  const verdicts = report.verdicts ?? [];
  const strengths = report.strengths ?? [];
  const weaknesses = report.weaknesses ?? [];
  const plan = report.training_plan ?? [];

  return (
    <div className="space-y-8">
      {/* Score global */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Score global", value: overall },
          { label: "Fond", value: fond },
          { label: "Forme", value: forme },
        ].map((s) => (
          <div key={s.label} className="rounded-md bg-secondary p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="tabular font-display text-2xl font-extrabold">
              {s.value !== null ? `${Math.round(s.value)}` : "—"}
              <span className="ml-1 text-sm font-normal text-muted-foreground">/100</span>
            </p>
          </div>
        ))}
      </div>

      {/* Verdicts verbatim — le cœur */}
      {verdicts.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold tracking-tight">Le verdict du comité</h2>
          <div className="space-y-3">
            {verdicts.map((v, i) => {
              const vote = str(v, "vote", "decision").toLowerCase();
              return (
                <Card key={i}>
                  <CardContent className="space-y-2 pt-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{str(v, "name", "persona", "actor") || "Juge"}</p>
                      {vote ? <Badge variant={VOTE_BADGE[vote] ?? "neutral"}>{vote}</Badge> : null}
                    </div>
                    <p className="flex gap-2 text-sm italic text-muted-foreground">
                      <Quote className="size-4 shrink-0 text-coral-strong" />
                      {str(v, "verdict", "text", "analysis", "content")}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Radar de pitch (barres) */}
      {radar.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold tracking-tight">Tes axes de pitch</h2>
          <div className="space-y-2 rounded-xl border border-border bg-card p-4">
            {radar.map((ax, i) => {
              const score = num(ax, "score") ?? 0;
              const max = 10;
              return (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-44 shrink-0 truncate text-muted-foreground">
                    {str(ax, "label", "axis")}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-coral-strong"
                      style={{ width: `${Math.round((score / max) * 100)}%` }}
                    />
                  </div>
                  <span className="tabular w-8 text-right font-medium">{Math.round(score)}</span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Forces & axes de travail */}
      {strengths.length > 0 || weaknesses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {strengths.length > 0 ? (
            <Card>
              <CardContent className="space-y-2 pt-5">
                <h3 className="flex items-center gap-2 font-display text-base font-bold">
                  <CheckCircle2 className="size-5 text-success" /> Tes forces
                </h3>
                <ul className="space-y-1.5">
                  {strengths.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {str(s, "text", "label") || String(s)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
          {weaknesses.length > 0 ? (
            <Card>
              <CardContent className="space-y-2 pt-5">
                <h3 className="flex items-center gap-2 font-display text-base font-bold">
                  <AlertTriangle className="size-5 text-warning" /> À travailler
                </h3>
                <ul className="space-y-1.5">
                  {weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {str(w, "text", "label") || String(w)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {/* Plan d'entraînement */}
      {plan.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold tracking-tight">Ton plan d&apos;entraînement</h2>
          <div className="space-y-2">
            {plan.map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="tabular mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                  {i + 1}
                </span>
                <p className="text-sm">{str(p, "title", "label", "action", "text")}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button asChild>
          <Link href={routes.pitchSim}>
            Rejouer un pitch
            <ArrowRight className="size-5" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={routes.academy}>Travailler avec l&apos;Academy</Link>
        </Button>
      </div>
    </div>
  );
}
