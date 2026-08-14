import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/shared/ui";

/** Carte d'action « prochaine étape » — mène vers un espace du parcours. */
export function NextCard({
  icon: Icon,
  href,
  title,
  text,
}: {
  icon: React.ElementType;
  href: string;
  title: string;
  text: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-shadow hover:border-border-strong hover:shadow-sm">
        <CardContent className="flex h-full flex-col gap-2 pt-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          <h3 className="font-display font-bold">{title}</h3>
          <p className="flex-1 text-sm text-muted-foreground">{text}</p>
          <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  );
}
