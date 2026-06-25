import Link from "next/link";

import { routes } from "@/shared/config/routes";

/** Pied de page public, sobre. */
export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {2026} Ideaxion — Deviens capable et confiant.</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href={routes.blog} className="hover:text-foreground">
            Blog
          </Link>
          <Link href={routes.contact} className="hover:text-foreground">
            Contact
          </Link>
          <Link
            href={routes.legal("confidentialite")}
            className="hover:text-foreground"
          >
            Confidentialité
          </Link>
          <Link
            href={routes.legal("mentions")}
            className="hover:text-foreground"
          >
            Mentions légales
          </Link>
        </nav>
      </div>
    </footer>
  );
}
