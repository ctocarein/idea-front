import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { Button, ThemeToggle } from "@/shared/ui";

const links = [
  { href: routes.startups, label: "Startups" },
  { href: routes.financeurs, label: "Financeurs" },
  { href: routes.diagnostic, label: "Diagnostic" },
];

/** En-tête du site public. Mobile-first : nav condensée sous `sm`. */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link
          href={routes.home}
          className="font-display text-lg font-extrabold text-ink"
        >
          Ideaxion
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
          <ThemeToggle />
          <Button asChild size="sm" variant="ghost">
            <Link href={routes.login}>Connexion</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={routes.diagnostic}>Démarrer</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
