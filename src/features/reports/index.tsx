import { Download, FileText } from "lucide-react";

import { Badge, Button, Card, CardContent } from "@/shared/ui";

export { BilanView } from "./components/BilanView";
export { BilanPending } from "./components/BilanPending";

/**
 * Feature reports — le bilan in-app (PAS d'email, BESOINS_PORTEUR cas 8).
 * Données mockées ; au Sprint INT : `/reports/*`, PDF via presigned download.
 */
export interface Report {
  id: string;
  title: string;
  status: "ready" | "pending";
  createdAt: string;
}

export const mockReports: Report[] = [
  {
    id: "r1",
    title: "Bilan de compréhension",
    status: "ready",
    createdAt: "20 juin 2026",
  },
];

export function ReportsList({ reports = mockReports }: { reports?: Report[] }) {
  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <h3 className="font-display text-base font-bold">Mes bilans</h3>
        {reports.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-lg border border-border p-3"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.createdAt}</p>
            </div>
            {r.status === "ready" ? (
              <Button size="sm" variant="outline" disabled>
                <Download className="size-4" />
                PDF
              </Button>
            ) : (
              <Badge variant="warning">En préparation</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
