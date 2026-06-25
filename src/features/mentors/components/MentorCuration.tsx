"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

import { Badge, Button, Card, CardContent, toast } from "@/shared/ui";
import {
  mockApplications,
  mockMentors,
  type Mentor,
  type MentorApplication,
} from "../data/mock";

/**
 * Curation mentors (côté admin) — le garde-fou qualité (BESOINS_ADMIN cas 2).
 * Examiner une candidature → créer le compte ; activer / suspendre un mentor.
 * Actions mockées.
 */
export function MentorCuration() {
  const [apps, setApps] = useState<MentorApplication[]>(mockApplications);
  const [mentors, setMentors] = useState<Mentor[]>(mockMentors);

  function decide(app: MentorApplication, accept: boolean) {
    setApps((list) => list.filter((a) => a.id !== app.id));
    if (accept) {
      setMentors((list) => [
        ...list,
        {
          id: `new-${app.id}`,
          name: app.name,
          sectors: app.sectors,
          bio: "Profil à compléter (invitation envoyée).",
          verified: false,
          feeEur: null,
          status: "marketplace",
        },
      ]);
      toast.success(`Compte créé pour ${app.name} — invitation envoyée`);
    } else {
      toast("Candidature refusée");
    }
  }

  function toggle(m: Mentor) {
    const next: Mentor["status"] =
      m.status === "marketplace" ? "suspended" : "marketplace";
    setMentors((list) =>
      list.map((x) => (x.id === m.id ? { ...x, status: next } : x)),
    );
    toast.success(
      next === "suspended" ? `${m.name} suspendu` : `${m.name} réactivé`,
    );
  }

  return (
    <div className="space-y-8">
      {/* Candidatures */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold tracking-tight">
          Candidatures
        </h2>
        {apps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune candidature en attente.
          </p>
        ) : (
          apps.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.email} · {a.sectors.join(", ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => decide(a, false)}
                  >
                    Refuser
                  </Button>
                  <Button size="sm" onClick={() => decide(a, true)}>
                    Créer le compte
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {/* Mentors */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold tracking-tight">
          Mentors
        </h2>
        {mentors.map((m) => (
          <Card key={m.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-secondary font-display text-sm font-bold">
                  {m.name.charAt(0)}
                </span>
                <div>
                  <p className="flex items-center gap-1.5 font-medium">
                    {m.name}
                    {m.verified ? (
                      <ShieldCheck className="size-4 text-coral-strong" />
                    ) : null}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {m.sectors.join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={m.status === "marketplace" ? "success" : "danger"}
                >
                  {m.status === "marketplace" ? "Actif" : "Suspendu"}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => toggle(m)}>
                  {m.status === "marketplace" ? "Suspendre" : "Réactiver"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
