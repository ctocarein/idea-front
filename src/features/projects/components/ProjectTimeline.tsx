export interface TimelineEvent {
  label: string;
  when: string;
}

/** Timeline générique d'un projet (mock ; au Sprint INT : `/projects/{id}/timeline`). */
export function ProjectTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[1.4rem] top-1 size-2.5 rounded-full bg-coral-strong" />
          <p className="text-sm font-medium">{e.label}</p>
          <p className="text-xs text-muted-foreground">{e.when}</p>
        </li>
      ))}
    </ol>
  );
}
