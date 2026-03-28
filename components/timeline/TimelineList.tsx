import Link from "next/link";
import type { CareLogEntry } from "../../lib/bubloo/types";
import { IconHandoff } from "../icons";
import { TimelineEventCard } from "./TimelineEventCard";

export function TimelineList({
  logs,
}: {
  logs: CareLogEntry[];
}) {
  return (
    <div className="stack">
      <div className="timeline-list">
        {logs.map((log) => (
          <TimelineEventCard key={log.id} log={log} />
        ))}
      </div>

      <Link className="button-primary" href="/handoff">
        <IconHandoff size={18} />
        Create handoff
      </Link>
    </div>
  );
}
