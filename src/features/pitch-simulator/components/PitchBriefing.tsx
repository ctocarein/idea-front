"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Users } from "lucide-react";

import { routes } from "@/shared/config/routes";
import { Button, Card, CardContent, Chip, toast } from "@/shared/ui";
import { startSession } from "../actions";
import type { Committee } from "../api";

const FORMATS = [
  { key: "elevator", label: "Elevator", hint: "1 min" },
  { key: "standard", label: "Standard", hint: "3 min" },
  { key: "long", label: "Long", hint: "5 min" },
];

export function PitchBriefing({
  committees,
  projectId,
}: {
  committees: Committee[];
  projectId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [committee, setCommittee] = useState(committees[0]?.key ?? "");
  const [format, setFormat] = useState("standard");

  function enter() {
    if (!committee) return;
    startTransition(async () => {
      const res = await startSession(committee, format, projectId);
      if (res.ok) router.push(routes.pitchSimSession(res.sessionId));
      else toast.error(res.message);
    });
  }

  if (committees.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Aucun comité disponible pour le moment.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold tracking-tight">Choisis ton comité</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {committees.map((c) => {
            const selected = c.key === committee;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCommittee(c.key)}
                aria-pressed={selected}
                className={`rounded-2xl border bg-card p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 ${
                  selected ? "border-coral-strong ring-2 ring-coral-strong/20" : "border-border hover:border-coral-strong/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-coral-strong" />
                  <h3 className="font-display font-bold">{c.label}</h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.personas.length} juges
                </p>
                <ul className="mt-3 space-y-1.5">
                  {c.personas.map((p) => (
                    <li key={p.name} className="text-sm">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground"> — {p.role}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold tracking-tight">Format</h2>
        <div className="flex flex-wrap gap-2">
          {FORMATS.map((f) => (
            <Chip key={f.key} selected={format === f.key} onClick={() => setFormat(f.key)}>
              {f.label} · {f.hint}
            </Chip>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button onClick={enter} loading={pending} size="md">
          Entrer dans la salle
          <ArrowRight className="size-5" />
        </Button>
        <p className="text-sm text-muted-foreground">
          Le comité ne te coupera jamais. Tu annonces toi-même la fin de ton pitch.
        </p>
      </div>
    </div>
  );
}
