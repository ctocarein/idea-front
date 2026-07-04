import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { RefreshCw } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { routes } from "@/shared/config/routes";
import { ApiError } from "@/shared/api/client";
import { Button, Card, CardContent } from "@/shared/ui";
import { getReportDetail } from "@/features/reports/api";
import { BilanPending, BilanView } from "@/features/reports";

export const metadata: Metadata = { title: "Mon bilan" };

export default async function BilanPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;

  let report;
  try {
    report = await getReportDetail(reportId);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  if (report.status === "ready") return <BilanView report={report} />;
  if (report.status === "failed") {
    const t = await getTranslations("Bilan.failed");
    return (
      <Card>
        <CardContent className="space-y-3 py-12 text-center">
          <h2 className="font-display text-xl font-bold">{t("title")}</h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            {t("text")}
          </p>
          <Button asChild>
            <Link href={routes.diagnostic}>
              <RefreshCw className="size-4" />
              {t("cta")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <BilanPending reportId={reportId} />;
}
