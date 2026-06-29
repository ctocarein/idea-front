"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  FolderKanban,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mic,
  ScrollText,
  Share2,
  SlidersHorizontal,
  Target,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { ThemeToggle } from "@/shared/ui";

/**
 * Registre d'icônes (clé → composant). On passe une CLÉ (string, sérialisable)
 * dans les layouts serveur ; l'icône (fonction, non sérialisable) est résolue
 * ici, côté client. C'est ce qui permet à un Server Component de configurer la
 * nav sans franchir la frontière avec des fonctions.
 */
export const NAV_ICONS = {
  overview: LayoutDashboard,
  academy: GraduationCap,
  pitch: Mic,
  mentors: Users,
  readiness: Target,
  opportunities: Compass,
  projects: FolderKanban,
  grid: SlidersHorizontal,
  audit: ScrollText,
  profile: UserCircle,
  requests: Inbox,
  share: Share2,
} satisfies Record<string, LucideIcon>;

export type NavIcon = keyof typeof NAV_ICONS;

export interface NavItem {
  href: string;
  label: string;
  /** Libellé court pour la nav basse mobile (sinon `label`). */
  shortLabel?: string;
  icon: NavIcon;
}

export interface AppShellProps {
  /** Libellé de l'espace (ex. « Espace porteur »). */
  spaceLabel: string;
  nav: NavItem[];
  user: { name: string; roleLabel: string };
  /** Server action de déconnexion (passée par le layout serveur). */
  signOutAction: () => void | Promise<void>;
  children: React.ReactNode;
}

/** Trouve l'item actif : le href le plus long qui préfixe le pathname. */
function activeHref(nav: NavItem[], pathname: string): string | null {
  const matches = nav
    .filter(
      (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
    )
    .sort((a, b) => b.href.length - a.href.length);
  return matches[0]?.href ?? null;
}

/**
 * Coquille des espaces authentifiés (CHARTE : « la nuit » — sidebar indigo).
 * Mobile-first : barre haute + nav basse à pouce ; sidebar dès `lg`.
 * Sans métier : reçoit ses items et l'utilisateur en props.
 */
export function AppShell({
  spaceLabel,
  nav,
  user,
  signOutAction,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const active = activeHref(nav, pathname);

  return (
    <div className="flex min-h-full flex-1 lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Sidebar — desktop */}
      <aside className="hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="font-display text-lg font-extrabold">
            Ideaxion
          </Link>
        </div>
        <p className="px-6 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
          {spaceLabel}
        </p>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((item) => {
            const Icon = NAV_ICONS[item.icon];
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent font-display text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/50">
                {user.roleLabel}
              </p>
            </div>
            <ThemeToggle />
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sidebar-ring/25"
            >
              <LogOut className="size-5" />
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {/* Colonne contenu */}
      <div className="flex flex-1 flex-col">
        {/* Topbar — mobile */}
        <header className="flex h-14 items-center justify-between bg-sidebar px-4 text-sidebar-foreground lg:hidden">
          <Link href="/" className="font-display text-base font-extrabold">
            Ideaxion
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <form action={signOutAction}>
              <button
                type="submit"
                aria-label="Se déconnecter"
                className="inline-flex size-9 items-center justify-center rounded-full text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sidebar-ring/25"
              >
                <LogOut className="size-5" />
              </button>
            </form>
          </div>
        </header>

        <main
          id="main-content"
          className="flex-1 px-5 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8"
        >
          {children}
        </main>

        {/* Nav basse — mobile (cibles ≥ 44px) */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card lg:hidden">
          {nav.map((item) => {
            const Icon = NAV_ICONS[item.icon];
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors",
                  isActive ? "text-coral-strong" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                <span className="max-w-full truncate">{item.shortLabel ?? item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
