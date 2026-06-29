import { apiFetch } from "@/shared/api/client";

export interface NotificationOut {
  id: string;
  type: string;
  payload: Record<string, string>;
  unread: boolean;
  read_at: string | null;
  created_at: string;
}

/** Liste des notifications du porteur connecté (non lues d'abord). */
export async function getNotifications(): Promise<NotificationOut[]> {
  return apiFetch<NotificationOut[]>("/api/v1/notifications");
}
