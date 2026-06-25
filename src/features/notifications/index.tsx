import { Bell, CheckCircle2, GraduationCap, Mic } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/shared/ui";

/**
 * Feature notifications — in-app léger (BESOINS_PORTEUR cas 8 : pas d'email).
 * Données mockées ; au Sprint INT : flux backend.
 */
interface Notification {
  id: string;
  icon: LucideIcon;
  text: string;
  when: string;
  unread?: boolean;
}

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    icon: CheckCircle2,
    text: "Ton bilan de compréhension est prêt.",
    when: "il y a 2 j",
    unread: true,
  },
  {
    id: "n2",
    icon: Mic,
    text: "Tu as progressé de +9 au simulateur de pitch.",
    when: "il y a 3 j",
  },
  {
    id: "n3",
    icon: GraduationCap,
    text: "Nouveau module : « Le modèle économique ».",
    when: "il y a 5 j",
  },
];

export function NotificationsList({
  notifications = mockNotifications,
}: {
  notifications?: Notification[];
}) {
  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <h3 className="flex items-center gap-2 font-display text-base font-bold">
          <Bell className="size-4" />
          Notifications
        </h3>
        <ul className="space-y-1">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <li
                key={n.id}
                className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-secondary/50"
              >
                <span className="mt-0.5 text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{n.text}</p>
                  <p className="text-xs text-muted-foreground">{n.when}</p>
                </div>
                {n.unread ? (
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-coral-strong"
                    aria-label="Non lu"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
