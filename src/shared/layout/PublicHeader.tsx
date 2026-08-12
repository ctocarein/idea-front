import { useTranslations } from "next-intl";

import { routes } from "@/shared/config/routes";
import { Link } from "@/i18n/navigation";
import { Button, Logo, ThemeToggle } from "@/shared/ui";
import { LocaleSwitcher } from "./LocaleSwitcher";

/** En-tête du site public. Mobile-first : nav condensée sous `sm`. */
export function PublicHeader() {
  const t = useTranslations("PublicHeader");
  const links = [
    { href: routes.startups, label: t("startups") },
    { href: routes.institutions, label: t("institutions") },
    { href: routes.financeurs, label: t("financiers") },
    { href: routes.diagnostic, label: t("diagnostic") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href={routes.home} aria-label="Ideaxion — accueil">
          <Logo className="h-7" />
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button asChild size="sm" variant="ghost">
            <Link href={routes.login}>{t("login")}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={routes.diagnostic}>{t("cta")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
