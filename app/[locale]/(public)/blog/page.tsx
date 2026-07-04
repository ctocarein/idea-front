import type { Metadata } from "next";
import { Newspaper } from "lucide-react";

import { EmptyState } from "@/shared/ui";

export const metadata: Metadata = { title: "Blog" };

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
        Le blog
      </h1>
      <p className="mt-3 text-muted-foreground">
        Des ressources pour comprendre, structurer et défendre ton projet.
      </p>
      <div className="mt-8">
        <EmptyState
          icon={Newspaper}
          title="Les premiers articles arrivent"
          description="On prépare des guides concrets : BP, pitch, modèle éco."
        />
      </div>
    </div>
  );
}
