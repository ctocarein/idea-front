import { ApiError } from "@/shared/api/client";
import { Card, CardContent } from "@/shared/ui";
import { getNotifications } from "./api";
import { NotificationsClient } from "./NotificationsClient";

/**
 * Notifications in-app du porteur (BESOINS_PORTEUR cas 8 : pas d'email).
 * Charge la liste côté serveur, délègue les interactions (lire/tout lire) au client.
 * Trigger backend : `report_ready` quand le bilan passe à "ready" dans handlers.py.
 */
export async function NotificationsList() {
  let notifs: Awaited<ReturnType<typeof getNotifications>> = [];
  try {
    notifs = await getNotifications();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <NotificationsClient initialNotifs={notifs} />
      </CardContent>
    </Card>
  );
}
