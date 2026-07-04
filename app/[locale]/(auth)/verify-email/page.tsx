import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button, Card, CardContent } from "@/shared/ui";
import { routes } from "@/shared/config/routes";
import { Link } from "@/i18n/navigation";
import { verifyEmail } from "@/features/auth";

export const metadata: Metadata = { title: "Vérification de l'email" };
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const res = token ? await verifyEmail(token) : { ok: false };
  const t = await getTranslations("EmailVerify");

  return (
    <Card className="mx-auto mt-16 w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        {res.ok ? (
          <>
            <CheckCircle2 className="size-12 text-emerald-500" />
            <h1 className="font-display text-xl font-bold tracking-tight">{t("okTitle")}</h1>
            <p className="max-w-xs text-sm text-muted-foreground">{t("okText")}</p>
            <Button asChild className="mt-2">
              <Link href={routes.dashboard}>{t("okCta")}</Link>
            </Button>
          </>
        ) : (
          <>
            <XCircle className="size-12 text-muted-foreground" />
            <h1 className="font-display text-xl font-bold tracking-tight">{t("koTitle")}</h1>
            <p className="max-w-xs text-sm text-muted-foreground">{t("koText")}</p>
            <Button asChild variant="outline" className="mt-2">
              <Link href={routes.dashboard}>{t("koCta")}</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
