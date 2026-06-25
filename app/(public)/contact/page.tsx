import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
        Parlons de ton projet.
      </h1>
      <p className="mt-3 text-muted-foreground">
        Porteur, mentor ou financeur — on te répond.
      </p>

      <a
        href="mailto:hello@ideaxion.test"
        className="mt-8 inline-flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-secondary"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-coral/15 text-coral-strong">
          <Mail className="size-5" />
        </span>
        <span>
          <span className="block text-sm text-muted-foreground">Écris-nous</span>
          <span className="font-medium">hello@ideaxion.test</span>
        </span>
      </a>
    </div>
  );
}
