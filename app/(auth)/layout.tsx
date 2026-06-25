import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { ThemeToggle } from "@/shared/ui";

/** Coquille auth : centrée, sobre, mobile-first. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-grid">
      <header className="flex h-16 items-center justify-between px-5">
        <Link
          href={routes.home}
          className="font-display text-lg font-extrabold text-ink"
        >
          Ideaxion
        </Link>
        <ThemeToggle />
      </header>
      <main
        id="main-content"
        className="flex flex-1 items-center justify-center px-5 py-10"
      >
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
