import Link from "next/link";
import type { CareLogEntry } from "../../lib/bubloo/types";
import { IconHandoff } from "../icons";
import { TimelineEventCard } from "./TimelineEventCard";

function getDayLabel(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const logDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (logDay.getTime() === today.getTime()) return "Today";
  if (logDay.getTime() === yesterday.getTime()) return "Yesterday";

  return logDay.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export function TimelineList({
  logs,
}: {
  logs: CareLogEntry[];
}) {
  let lastDayLabel = "";

  return (
    <div className="stack">
      <div className="timeline-list">
        {logs.map((log) => {
          const dayLabel = getDayLabel(log.timestamp);
          const showDivider = dayLabel !== lastDayLabel;
          lastDayLabel = dayLabel;

          return (
            <div key={log.id}>
              {showDivider ? (
                <div className="timeline-day-divider">{dayLabel}</div>
              ) : null}
              <TimelineEventCard log={log} />
            </div>
          );
        })}
      </div>

      <Link className="button-primary" href="/handoff">
        <IconHandoff size={18} />
        Create handoff
      </Link>
    </div>
  );
}
