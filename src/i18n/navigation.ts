import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/** Navigation localisée : Link/redirect/useRouter qui ajoutent le préfixe de locale. */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
