"use client";

import { useState, useTransition } from "react";
import { Copy, Link2, Eye, Clock, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { toast } from "@/shared/ui";

import { revokeShare } from "./sharingActions";

export interface ShareStats {
  id: string;
  project_id: string;
  project_title: string;
  share_url: string;
  is_active: boolean;
  expires_at: string;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const relativeFmt = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatRelative(iso: string): string {
  const days = daysUntil(iso);
  if (Math.abs(days) < 1) return "aujourd'hui";
  if (Math.abs(days) < 30) return relativeFmt.format(days, "day");
  return dateFmt.format(new Date(iso));
}

interface ShareCardProps {
  share: ShareStats;
  onRevoked: (id: string) => void;
}

function ShareCard({ share, onRevoked }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const frontOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = share.share_url ? `${frontOrigin}${share.share_url}` : "";

  async function handleCopy() {
    if (!fullUrl) return;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRevoke() {
    startTransition(async () => {
      const result = await revokeShare(share.project_id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Lien révoqué.");
      onRevoked(share.id);
    });
  }

  const daysLeft = daysUntil(share.expires_at);
  const expiringSoon = share.is_active && daysLeft < 14;

  return (
    <Card className={share.is_active ? undefined : "opacity-60"}>
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-semibold leading-tight truncate">{share.project_title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Créé le {dateFmt.format(new Date(share.created_at))}
            </p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              share.is_active
                ? "bg-success/15 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {share.is_active ? (
              <><CheckCircle2 className="size-3" /> Actif</>
            ) : (
              <><AlertCircle className="size-3" /> Révoqué</>
            )}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
              <Eye className="size-3.5" />
              <span className="text-xs">Vues</span>
            </div>
            <p className="text-xl font-bold">{share.view_count}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
              <Clock className="size-3.5" />
              <span className="text-xs">Expire</span>
            </div>
            <p className={`text-xs font-semibold mt-1 ${expiringSoon ? "text-warning" : ""}`}>
              {share.is_active ? formatRelative(share.expires_at) : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
              <Eye className="size-3.5" />
              <span className="text-xs">Dernière vue</span>
            </div>
            <p className="text-xs font-semibold mt-1">
              {share.last_viewed_at ? formatRelative(share.last_viewed_at) : "—"}
            </p>
          </div>
        </div>

        {/* URL + actions */}
        {share.is_active && fullUrl && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
            <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate text-xs text-muted-foreground font-mono">
              {fullUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 text-xs font-medium text-primary hover:underline"
            >
              {copied ? "Copié !" : <Copy className="size-3.5" />}
            </button>
          </div>
        )}

        {share.is_active && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRevoke}
              disabled={isPending}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-1.5 size-3.5" />
              {isPending ? "Révocation…" : "Révoquer ce lien"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface Props {
  shares: ShareStats[];
}

export function SharesDashboard({ shares: initialShares }: Props) {
  const [shares, setShares] = useState(initialShares);

  function handleRevoked(id: string) {
    setShares((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: false } : s))
    );
  }

  const active = shares.filter((s) => s.is_active);
  const revoked = shares.filter((s) => !s.is_active);

  if (shares.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <p className="text-muted-foreground text-sm">
          Aucun lien de partage pour l&apos;instant.
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          Crée un lien depuis la page Opportunités pour partager ta fiche projet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {active.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Liens actifs ({active.length})
          </h2>
          {active.map((s) => (
            <ShareCard key={s.id} share={s} onRevoked={handleRevoked} />
          ))}
        </section>
      )}

      {revoked.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Liens révoqués ({revoked.length})
          </h2>
          {revoked.map((s) => (
            <ShareCard key={s.id} share={s} onRevoked={handleRevoked} />
          ))}
        </section>
      )}
    </div>
  );
}
