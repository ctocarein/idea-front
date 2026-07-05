import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { routes } from "@/shared/config/routes";
import { getSession } from "@/shared/auth/server";
import { SessionProvider, SPACE_ROLES } from "@/shared/auth";
import { AppShell, type NavItem } from "@/shared/layout";
import { signOut } from "@/features/auth";

/** Espace privé (auth-gated) → jamais indexé. */
export const metadata = { robots: { index: false, follow: false } };

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect(routes.login);
  if (!SPACE_ROLES["/mentor"].includes(session.role))
    redirect(routes.forbidden);

  const t = await getTranslations("Mentor");
  const nav: NavItem[] = [
    { href: routes.mentorHome, label: t("nav.profile"), icon: "profile" },
    { href: `${routes.mentorHome}/requests`, label: t("nav.requests"), icon: "requests" },
  ];

  return (
    <SessionProvider session={session}>
      <AppShell
        spaceLabel={t("space")}
        nav={nav}
        user={{ name: session.name, roleLabel: t("role") }}
        signOutAction={signOut}
      >
        {children}
      </AppShell>
    </SessionProvider>
  );
}
