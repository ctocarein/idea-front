"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Clock, CheckCircle2, XCircle, Calendar, PartyPopper, X } from "lucide-react";

import { Badge, Button, Card, CardContent, EmptyState, toast } from "@/shared/ui";

import type { MentorRequestDetail } from "../api";
import { cancelRequest } from "../actions";

type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "outline";

const STATUS_CONFIG: Record<
  string,
  { variant: BadgeVariant; icon: React.ElementType }
> = {
  requested:       { variant: "warning",  icon: Clock },
  accepted:        { variant: "primary",  icon: CheckCircle2 },
  declined:        { variant: "danger",   icon: XCircle },
  session_planned: { variant: "success",  icon: Calendar },
  done:            { variant: "neutral",  icon: PartyPopper },
  cancelled:       { variant: "outline",  icon: X },
};

const CANCELLABLE = new Set(["requested", "accepted", "session_planned"]);

interface Props {
  initialRequests: MentorRequestDetail[];
}

export function MyMentorRequests({ initialRequests }: Props) {
  const t = useTranslations("Mentor.myRequests");
  const tStatus = useTranslations("Mentor.status");
  const locale = useLocale();
  const fmtDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString(locale, {
          day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
        })
      : null;
  const [requests, setRequests] = useState(initialRequests);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleCancel(id: string) {
    setCancellingId(id);
    const result = await cancelRequest(id);
    setCancellingId(null);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    startTransition(() => {
      setRequests((prev) => prev.map((r) => (r.id === id ? result.data : r)));
    });
  }

  const active = requests.filter((r) => !["done", "cancelled", "declined"].includes(r.status));
  const past   = requests.filter((r) =>  ["done", "cancelled", "declined"].includes(r.status));

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title={t("empty")}
        description={t("emptyDesc")}
      />
    );
  }

  function RequestCard({ req }: { req: MentorRequestDetail }) {
    const cfg = STATUS_CONFIG[req.status] ?? { variant: "neutral" as BadgeVariant, icon: Clock };
    const statusLabel = tStatus.has(req.status) ? tStatus(req.status) : req.status;
    const Icon = cfg.icon;
    const canCancel = CANCELLABLE.has(req.status);

    return (
      <Card>
        <CardContent className="space-y-3 pt-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{req.mentor_name}</p>
              <p className="text-sm text-muted-foreground">
                {t("sentOn", { date: fmtDate(req.created_at) ?? "" })}
              </p>
            </div>
            <Badge variant={cfg.variant}>
              <Icon className="size-3" />
              {statusLabel}
            </Badge>
          </div>

          {req.message && (
            <p className="rounded-lg bg-secondary/40 px-3 py-2 text-sm text-muted-foreground italic">
              « {req.message} »
            </p>
          )}

          {req.session_at && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-success">
              <Calendar className="size-4" />
              {t("sessionOn", { date: fmtDate(req.session_at) ?? "" })}
            </p>
          )}

          {canCancel && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                disabled={cancellingId === req.id}
                onClick={() => handleCancel(req.id)}
              >
                {cancellingId === req.id ? t("cancelling") : t("cancel")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("active")}
          </h3>
          {active.map((r) => <RequestCard key={r.id} req={r} />)}
        </div>
      )}
      {past.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("history")}
          </h3>
          {past.map((r) => <RequestCard key={r.id} req={r} />)}
        </div>
      )}
    </div>
  );
}
