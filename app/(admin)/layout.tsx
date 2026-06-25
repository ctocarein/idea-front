import { redirect } from "next/navigation";

import { routes } from "@/shared/config/routes";
import { getSession } from "@/shared/auth/server";
import { SessionProvider, SPACE_ROLES } from "@/shared/auth";
import { AppShell, type NavItem } from "@/shared/layout";
import { signOut } from "@/features/auth";

const NAV: NavItem[] = [
  { href: routes.admin, label: "Vue d'ensemble", icon: "overview" },
  { href: routes.adminProjects, label: "Projets", icon: "projects" },
  { href: routes.adminMentors, label: "Mentors", icon: "mentors" },
  { href: routes.adminScoringGrid, label: "Grille", icon: "grid" },
  { href: routes.adminAuditLogs, label: "Audit", icon: "audit" },
];

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrateur",
  analyst: "Analyste",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect(routes.login);
  if (!SPACE_ROLES["/admin"].includes(session.role)) redirect(routes.forbidden);

  return (
    <SessionProvider session={session}>
      <AppShell
        spaceLabel="Back-office"
        nav={NAV}
        user={{
          name: session.name,
          roleLabel: ROLE_LABEL[session.role] ?? session.role,
        }}
        signOutAction={signOut}
      >
        {children}
      </AppShell>
    </SessionProvider>
  );
}
