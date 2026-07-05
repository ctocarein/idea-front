import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { routes } from "@/shared/config/routes";
import { getSession } from "@/shared/auth/server";
import { SessionProvider, SPACE_ROLES } from "@/shared/auth";
import { AppShell, type NavItem } from "@/shared/layout";
import { signOut } from "@/features/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect(routes.login);
  if (!SPACE_ROLES["/admin"].includes(session.role)) redirect(routes.forbidden);

  const t = await getTranslations("Admin");
  const nav: NavItem[] = [
    { href: routes.admin, label: t("nav.overview"), shortLabel: t("nav.overviewShort"), icon: "overview" },
    { href: routes.adminProjects, label: t("nav.projects"), icon: "projects" },
    { href: routes.adminMentors, label: t("nav.mentors"), icon: "mentors" },
    { href: routes.adminOpportunities, label: t("nav.opportunities"), icon: "opportunities" },
    { href: routes.adminScoringGrid, label: t("nav.grid"), icon: "grid" },
    { href: routes.adminAuditLogs, label: t("nav.audit"), icon: "audit" },
  ];

  return (
    <SessionProvider session={session}>
      <AppShell
        spaceLabel={t("space")}
        nav={nav}
        user={{
          name: session.name,
          roleLabel: t.has(`roles.${session.role}`) ? t(`roles.${session.role}`) : session.role,
        }}
        signOutAction={signOut}
      >
        {children}
      </AppShell>
    </SessionProvider>
  );
}
