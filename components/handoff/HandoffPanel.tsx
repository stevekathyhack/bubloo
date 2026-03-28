import type { Handoff } from "../../lib/bubloo/types";
import { IconTrend } from "../icons";
import { HandoffActions } from "./HandoffActions";
import { HandoffSection } from "./HandoffSection";
import { HandoffSummaryCard } from "./HandoffSummaryCard";

export function HandoffPanel({
  handoff,
  pending,
  copied,
  onCopy,
  onRefresh,
  fromCaregiver,
}: {
  handoff: Handoff;
  pending: boolean;
  copied: boolean;
  onCopy: () => void;
  onRefresh: () => void;
  fromCaregiver: { name: string };
}) {
  return (
    <div className="stack">
      <HandoffSummaryCard handoff={handoff} fromName={fromCaregiver.name} />

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

      <HandoffActions
        onCopy={onCopy}
        onRefresh={onRefresh}
        pending={pending}
        copied={copied}
      />
    </div>
  );
}
