import { Construction } from "lucide-react";

/**
 * Placeholder d'écran à venir (Sprints D3+). Permet de rendre les espaces
 * naviguables dès D2 sans page blanche. Sera remplacé par le vrai feature.
 */
export function PagePlaceholder({
  title,
  sprint,
  description,
}: {
  title: string;
  sprint: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-2 text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-5 py-4 text-sm text-muted-foreground">
        <Construction className="size-5 text-warning" />
        <span>
          Écran livré au <span className="font-medium">{sprint}</span>.
        </span>
      </div>
    </div>
  );
}
