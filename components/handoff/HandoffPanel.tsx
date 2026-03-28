import type { Handoff } from "../../lib/bubloo/types";
import { IconClock, IconFolder, IconTrend } from "../icons";
import { HandoffActions } from "./HandoffActions";
import { HandoffSection } from "./HandoffSection";
import { HandoffSummaryCard } from "./HandoffSummaryCard";

export function HandoffPanel({
  handoff,
  pending,
  copied,
  onCopy,
  onRefresh,
}: {
  handoff: Handoff;
  pending: boolean;
  copied: boolean;
  onCopy: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="stack">
      <HandoffSummaryCard handoff={handoff} />

      <HandoffSection
        title="Keep in mind"
        items={handoff.keep_in_mind_today}
      />

      <div className="next-step-card">
        <div className="next-step-label">
          <IconTrend size={16} />
          Suggested next step
        </div>
        <p className="next-step-text">{handoff.suggested_next_step}</p>
      </div>

      <section>
        <div className="section-header">
          <IconFolder className="section-header-icon" size={16} />
          <h2 className="section-header-title">Why this summary</h2>
        </div>
        <ul className="why-chip-list">
          {handoff.why_this_summary.map((item) => (
            <li key={item} className="why-chip">
              <IconClock className="why-chip-icon" size={14} />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <HandoffActions
        onCopy={onCopy}
        onRefresh={onRefresh}
        pending={pending}
        copied={copied}
      />
    </div>
  );
}
