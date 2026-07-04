import { useTranslations } from "next-intl";

import { routes } from "@/shared/config/routes";
import { Link } from "@/i18n/navigation";

/** Pied de page public, sobre. */
export function PublicFooter() {
  const t = useTranslations("PublicFooter");
  return (
    <footer className="border-t border-border bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>{t("tagline", { year: 2026 })}</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href={routes.blog} className="hover:text-foreground">
            {t("blog")}
          </Link>
          <Link href={routes.contact} className="hover:text-foreground">
            {t("contact")}
          </Link>
          <Link href={routes.legal("confidentialite")} className="hover:text-foreground">
            {t("privacy")}
          </Link>
          <Link href={routes.legal("mentions")} className="hover:text-foreground">
            {t("legal")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
