export interface TimelineEvent {
  label: string;
  when: string;
  /** Transition « avant → après » quand l'audit en porte une. */
  detail?: string | null;
}

/**
 * Timeline d'un projet — alimentée par le journal d'audit backend
 * (`GET /admin/projects/{id}/timeline`), mis en forme côté page.
 */
export function ProjectTimeline({ events, emptyLabel }: { events: TimelineEvent[]; emptyLabel: string }) {
  if (events.length === 0) {
    return <p className="py-2 text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[1.4rem] top-1 size-2.5 rounded-full bg-coral-strong" />
          <p className="text-sm font-medium">{e.label}</p>
          {e.detail ? <p className="tabular text-xs text-muted-foreground">{e.detail}</p> : null}
          <p className="text-xs text-muted-foreground">{e.when}</p>
        </li>
      ))}
    </ol>
  );
}
