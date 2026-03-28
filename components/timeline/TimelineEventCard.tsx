import { formatClockTime, formatRelativeTime } from "../../lib/bubloo/time";
import { getLogTypeLabel, getTimelineDetail } from "../../lib/bubloo/timeline";
import type { CareLogEntry } from "../../lib/bubloo/types";
import { IconDiaper, IconFeed, IconMoon, IconNote, IconSun } from "../icons";

const TYPE_ICONS: Record<CareLogEntry["type"], React.ReactNode> = {
  feeding: <IconFeed size={18} />,
  sleep_start: <IconMoon size={18} />,
  wake: <IconSun size={18} />,
  diaper: <IconDiaper size={18} />,
  note: <IconNote size={18} />,
};

export function TimelineEventCard({
  log,
}: {
  log: CareLogEntry;
}) {
  const relativeTime = formatRelativeTime(log.timestamp);

  return (
    <article className="timeline-card">
      <div className="timeline-icon-col">
        <span className={`timeline-marker timeline-marker--${log.type}`}>
          {TYPE_ICONS[log.type]}
        </span>
      </div>
      <div className="timeline-body">
        <div className="timeline-label-row">
          <span className={`timeline-type-pill timeline-type-pill--${log.type}`}>
            {getLogTypeLabel(log.type)}
          </span>
          <span className="timeline-title">{relativeTime}</span>
        </div>
        <p className="timeline-detail">{getTimelineDetail(log)}</p>
      </div>
    </article>
  );
}
