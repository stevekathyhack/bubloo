import type { Handoff } from "../../lib/bubloo/types";
import { IconSparkle } from "../icons";

export function HandoffSummaryCard({
  handoff,
}: {
  handoff: Handoff;
}) {
  return (
    <section className="surface-card surface-card--featured card-padding">
      <div className="stack-tight">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconSparkle size={20} style={{ color: "var(--sky-deep)" }} />
          <h2 className="summary-headline">{handoff.headline}</h2>
        </div>
        <p className="summary-copy">{handoff.summary_text}</p>
      </div>
    </section>
  );
}
