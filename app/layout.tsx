import type { Metadata } from "next";

import { fontVariables } from "@/shared/styles/fonts";
import { AppProviders } from "@/shared/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ideaxion",
    template: "%s · Ideaxion",
  },
  description:
    "Comprends ton projet, apprends, entraîne-toi — et deviens capable et confiant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fontVariables} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:font-medium focus:shadow-[var(--shadow-card)] focus:ring-4 focus:ring-ring/25"
        >
          Aller au contenu principal
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
