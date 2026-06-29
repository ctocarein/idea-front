"use server";

import { apiFetch } from "@/shared/api/client";
import type { NotificationOut } from "./api";

/** Marque une notification comme lue. */
export async function markRead(notifId: string): Promise<NotificationOut | null> {
  try {
    return await apiFetch<NotificationOut>(`/api/v1/notifications/${notifId}/read`, {
      method: "PATCH",
    });
  } catch {
    return null;
  }
}

/** Marque toutes les notifications comme lues. */
export async function markAllRead(): Promise<{ updated: number } | null> {
  try {
    return await apiFetch<{ updated: number }>("/api/v1/notifications/mark-all-read", {
      method: "POST",
    });
  } catch {
    return null;
  }
}
