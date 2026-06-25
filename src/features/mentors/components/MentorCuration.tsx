"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Badge, Button, Card, CardContent, toast } from "@/shared/ui";
import {
  approveApplication,
  rejectApplication,
  setMentorActive,
} from "../actions";
import type { MentorApplication, MentorPublic } from "../api";

/**
 * Curation mentors (côté admin) — le garde-fou qualité (BESOINS_ADMIN cas 2).
 * Examiner une candidature → créer le compte ; suspendre un mentor actif. Données réelles.
 */
export function MentorCuration({
  applications,
  mentors,
}: {
  applications: MentorApplication[];
  mentors: MentorPublic[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [apps, setApps] = useState(applications);

  function decide(app: MentorApplication, accept: boolean) {
    startTransition(async () => {
      const res = accept
        ? await approveApplication(app.id)
        : await rejectApplication(app.id);
      if (res.ok) {
        setApps((list) => list.filter((a) => a.id !== app.id));
        toast.success(
          accept ? `Compte créé pour ${app.full_name}` : "Candidature refusée",
        );
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  }

  function suspend(mentor: MentorPublic) {
    startTransition(async () => {
      const res = await setMentorActive(mentor.user_id, false);
      if (res.ok) {
        toast.success(`${mentor.full_name} suspendu`);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Candidatures */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold tracking-tight">Candidatures</h2>
        {apps.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune candidature en attente.</p>
        ) : (
          apps.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                <div className="min-w-0">
                  <p className="font-medium">{a.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.email} · {a.sectors.join(", ")}
                  </p>
                  {a.bio ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.bio}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => decide(a, false)}
                  >
                    Refuser
                  </Button>
                  <Button size="sm" loading={pending} onClick={() => decide(a, true)}>
                    Créer le compte
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {/* Mentors actifs */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold tracking-tight">Mentors actifs</h2>
        {mentors.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun mentor actif pour l&apos;instant.</p>
        ) : (
          mentors.map((m) => (
            <Card key={m.user_id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-secondary font-display text-sm font-bold">
                    {m.full_name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-medium">{m.full_name}</p>
                    <p className="text-sm text-muted-foreground">{m.sectors.join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success">Actif</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => suspend(m)}
                  >
                    Suspendre
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
