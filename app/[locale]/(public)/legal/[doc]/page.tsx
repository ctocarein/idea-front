import type { Metadata } from "next";

const TITLES: Record<string, string> = {
  mentions: "Mentions légales",
  confidentialite: "Politique de confidentialité",
  cgv: "Conditions générales",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  return { title: TITLES[doc] ?? "Document légal" };
}

/* En Next 16, `params` est asynchrone. Contenu juridique réel au Sprint D6/OPS. */
export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
        {TITLES[doc] ?? "Document légal"}
      </h1>
      <p className="mt-4 text-muted-foreground">
        Le contenu juridique définitif sera publié avant la mise en production.
      </p>
    </div>
  );
}
