import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ApiError } from "@/shared/api/client";
import { getMentorIncomingRequests } from "@/features/mentors/api";
import { MentorRequests } from "@/features/mentors";

export const metadata: Metadata = { title: "Demandes" };

export default async function MentorRequestsPage() {
  const t = await getTranslations("Mentor.requestsPage");
  let requests: Awaited<ReturnType<typeof getMentorIncomingRequests>> = [];
  try {
    requests = await getMentorIncomingRequests();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>
      <MentorRequests initialRequests={requests} />
    </div>
  );
}
