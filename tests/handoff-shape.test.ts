import { describe, expect, it } from "vitest";
import { buildFallbackHandoffDraft, createPersistedHandoff, mergeWithFallbackDraft } from "../lib/bubloo/handoff";
import { DEMO_DEVICE_ID } from "../lib/bubloo/constants";
import { getSeedLogs } from "../lib/bubloo/store";

describe("handoff shape", () => {
  it("creates a persisted handoff with the spec fields", () => {
    const logs = getSeedLogs(new Date("2026-03-28T19:00:00.000Z"), DEMO_DEVICE_ID);
    const draft = buildFallbackHandoffDraft(logs, new Date("2026-03-28T19:00:00.000Z"));
    const handoff = createPersistedHandoff({
      deviceId: DEMO_DEVICE_ID,
      logs,
      draft,
      now: new Date("2026-03-28T19:00:00.000Z"),
    });

    expect(handoff.device_id).toBe(DEMO_DEVICE_ID);
    expect(handoff.headline).toBeTruthy();
    expect(handoff.summary_text).toBeTruthy();
    expect(handoff.keep_in_mind_today.length).toBeGreaterThanOrEqual(2);
    expect(handoff.keep_in_mind_today.length).toBeLessThanOrEqual(3);
    expect(handoff.why_this_summary.length).toBeGreaterThanOrEqual(2);
    expect(handoff.why_this_summary.length).toBeLessThanOrEqual(3);
    expect(handoff.suggested_next_step).toBeTruthy();
    expect(handoff.copy_text).toContain("What to keep in mind today:");
    expect(handoff.source_log_count).toBe(logs.length);
  });

  it("merges partial model output without losing the required shape", () => {
    const logs = getSeedLogs(new Date("2026-03-28T19:00:00.000Z"), DEMO_DEVICE_ID);
    const fallback = buildFallbackHandoffDraft(logs, new Date("2026-03-28T19:00:00.000Z"));

    const merged = mergeWithFallbackDraft(
      {
        headline: "Fresh Bubloo handoff",
        keep_in_mind_today: ["Baby was a little fussy before sleep"],
      },
      fallback,
    );

    expect(merged.headline).toBe("Fresh Bubloo handoff");
    expect(merged.summary_text).toBe(fallback.summary_text);
    expect(merged.keep_in_mind_today.length).toBeGreaterThanOrEqual(2);
    expect(merged.why_this_summary.length).toBeGreaterThanOrEqual(2);
    expect(merged.suggested_next_step).toBe(fallback.suggested_next_step);
  });
});
