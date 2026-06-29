"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, GraduationCap, Mic } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/shared/ui";
import { markRead, markAllRead } from "./actions";
import type { NotificationOut } from "./api";

/** Icône selon le type de notification. */
const TYPE_ICON: Record<string, LucideIcon> = {
  report_ready: CheckCircle2,
  new_lesson: GraduationCap,
  pitch_progress: Mic,
};

const dateFmt = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

function relativeTime(iso: string): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "à l'instant";
  if (abs < 3600) return dateFmt.format(Math.round(diff / 60), "minutes");
  if (abs < 86400) return dateFmt.format(Math.round(diff / 3600), "hours");
  return dateFmt.format(Math.round(diff / 86400), "days");
}

function notifText(n: NotificationOut): string {
  return n.payload?.title ?? n.type;
}

export function NotificationsClient({ initialNotifs }: { initialNotifs: NotificationOut[] }) {
  const router = useRouter();
  const [notifs, setNotifs] = useState(initialNotifs);
  const hasUnread = notifs.some((n) => n.unread);

  async function handleRead(id: string) {
    const updated = await markRead(id);
    if (updated) {
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false, read_at: updated.read_at } : n)));
    }
  }

  async function handleMarkAll() {
    const res = await markAllRead();
    if (res) {
      setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
      router.refresh();
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between pb-1">
        <h3 className="flex items-center gap-2 font-display text-base font-bold">
          <Bell className="size-4" />
          Notifications
          {hasUnread ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-coral-strong text-[10px] font-bold text-white">
              {notifs.filter((n) => n.unread).length}
            </span>
          ) : null}
        </h3>
        {hasUnread ? (
          <Button variant="ghost" size="sm" className="-mr-1 text-xs" onClick={handleMarkAll}>
            Tout lire
          </Button>
        ) : null}
      </div>

      {notifs.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">Aucune notification pour l'instant.</p>
      ) : (
        <ul className="space-y-0.5">
          {notifs.map((n) => {
            const Icon = TYPE_ICON[n.type] ?? Bell;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => n.unread && handleRead(n.id)}
                  className="flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
                >
                  <span className={["mt-0.5", n.unread ? "text-coral-strong" : "text-muted-foreground"].join(" ")}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={["text-sm", n.unread ? "font-medium" : ""].join(" ")}>
                      {notifText(n)}
                    </p>
                    <p className="text-xs text-muted-foreground">{relativeTime(n.created_at)}</p>
                  </div>
                  {n.unread ? (
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-coral-strong"
                      aria-label="Non lu"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
