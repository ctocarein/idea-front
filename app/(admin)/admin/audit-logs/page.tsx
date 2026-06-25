import type { Metadata } from "next";

import { Card, CardContent } from "@/shared/ui";

export const metadata: Metadata = { title: "Audit logs" };

const LOGS = [
  { actor: "Admin Ideaxion", action: "a changé le statut", target: "PayNow → Qualifié", when: "il y a 1 h" },
  { actor: "Mariam l'Analyste", action: "a été assignée à", target: "AgriConnect", when: "il y a 3 h" },
  { actor: "Admin Ideaxion", action: "a créé le compte mentor", target: "Sophie Ndiaye", when: "hier" },
  { actor: "Admin Ideaxion", action: "a suspendu", target: "Daniel Okeke", when: "hier" },
  { actor: "Admin Ideaxion", action: "a publié la grille", target: "v1 → v1.1", when: "il y a 2 j" },
];

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Audit logs
        </h1>
        <p className="text-muted-foreground">
          Chaque action sensible est tracée — pouvoir = traçabilité.
        </p>
      </div>

      <Card>
        <CardContent className="divide-y divide-border pt-2">
          {LOGS.map((l, i) => (
            <div key={i} className="flex items-center justify-between gap-3 py-3">
              <p className="text-sm">
                <span className="font-medium">{l.actor}</span> {l.action}{" "}
                <span className="text-muted-foreground">{l.target}</span>
              </p>
              <span className="shrink-0 text-xs text-muted-foreground">
                {l.when}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
