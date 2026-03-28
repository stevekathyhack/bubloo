import type { Handoff } from "../../lib/bubloo/types";

export function HandoffSummaryCard({
  handoff,
  fromName,
}: {
  handoff: Handoff;
  fromName?: string;
}) {
  return (
    <section className="surface-card surface-card--featured card-padding">
      <div className="stack-tight">
        {fromName ? (
          <div className="handoff-from-tag">
            <span>from <strong>{fromName}</strong></span>
          </div>
        ) : null}
        <p className="summary-copy">{handoff.summary_text}</p>
      </div>
    </section>
  );
}
