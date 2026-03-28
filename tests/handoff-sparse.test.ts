import { describe, expect, it } from "vitest";
import { buildFallbackHandoffDraft, buildCopyText, createPersistedHandoff } from "../lib/bubloo/handoff";
import { DEMO_DEVICE_ID } from "../lib/bubloo/constants";
import type { CareLogEntry } from "../lib/bubloo/types";

function minutesAgo(now: Date, minutes: number): string {
  return new Date(now.getTime() - minutes * 60_000).toISOString();
}

describe("handoff with sparse logs", () => {
  const now = new Date("2026-03-28T19:00:00.000Z");

  it("produces a valid handoff from only 2 logs", () => {
    const logs: CareLogEntry[] = [
      {
        id: "sparse-feed",
        device_id: DEMO_DEVICE_ID,
        type: "feeding",
        timestamp: minutesAgo(now, 45),
        amount_ml: 100,
        created_at: minutesAgo(now, 45),
      },
      {
        id: "sparse-note",
        device_id: DEMO_DEVICE_ID,
        type: "note",
        timestamp: minutesAgo(now, 20),
        note: "Seemed calm after feeding",
        created_at: minutesAgo(now, 20),
      },
    ];

    const draft = buildFallbackHandoffDraft(logs, now);

    expect(draft.headline).toBeTruthy();
    expect(draft.summary_text).toBeTruthy();
    expect(draft.keep_in_mind_today.length).toBeGreaterThanOrEqual(2);
    expect(draft.keep_in_mind_today.length).toBeLessThanOrEqual(3);
    expect(draft.why_this_summary.length).toBeGreaterThanOrEqual(2);
    expect(draft.why_this_summary.length).toBeLessThanOrEqual(3);
    expect(draft.suggested_next_step).toBeTruthy();
    expect(draft.summary_text.toLowerCase()).not.toContain("warning");
    expect(draft.summary_text.toLowerCase()).not.toContain("abnormal");
  });

  it("produces a valid handoff from zero logs", () => {
    const draft = buildFallbackHandoffDraft([], now);

    expect(draft.headline).toBe("Bubloo update");
    expect(draft.summary_text).toBeTruthy();
    expect(draft.keep_in_mind_today.length).toBeGreaterThanOrEqual(2);
    expect(draft.why_this_summary.length).toBeGreaterThanOrEqual(2);
    expect(draft.suggested_next_step).toBeTruthy();
  });

  it("includes free-form notes in the summary when present", () => {
    const logs: CareLogEntry[] = [
      {
        id: "note-only",
        device_id: DEMO_DEVICE_ID,
        type: "note",
        timestamp: minutesAgo(now, 15),
        note: "Baby hiccupped after feeding",
        created_at: minutesAgo(now, 15),
      },
    ];

    const draft = buildFallbackHandoffDraft(logs, now);
    expect(draft.summary_text.toLowerCase()).toContain("hiccupped");
  });

  it("builds copy_text that includes all required handoff sections", () => {
    const logs: CareLogEntry[] = [
      {
        id: "feed-1",
        device_id: DEMO_DEVICE_ID,
        type: "feeding",
        timestamp: minutesAgo(now, 40),
        amount_ml: 120,
        created_at: minutesAgo(now, 40),
      },
      {
        id: "sleep-1",
        device_id: DEMO_DEVICE_ID,
        type: "sleep_start",
        timestamp: minutesAgo(now, 25),
        created_at: minutesAgo(now, 25),
      },
    ];

    const draft = buildFallbackHandoffDraft(logs, now);
    const copyText = buildCopyText(draft);

    expect(copyText).toContain("What to keep in mind today:");
    expect(copyText).toContain("Suggested next step:");
    expect(copyText).toContain("Why this summary:");
  });

  it("creates a full persisted handoff from sparse logs", () => {
    const logs: CareLogEntry[] = [
      {
        id: "sparse-diaper",
        device_id: DEMO_DEVICE_ID,
        type: "diaper",
        timestamp: minutesAgo(now, 60),
        created_at: minutesAgo(now, 60),
      },
      {
        id: "sparse-sleep",
        device_id: DEMO_DEVICE_ID,
        type: "sleep_start",
        timestamp: minutesAgo(now, 10),
        created_at: minutesAgo(now, 10),
      },
    ];

    const draft = buildFallbackHandoffDraft(logs, now);
    const handoff = createPersistedHandoff({
      deviceId: DEMO_DEVICE_ID,
      logs,
      draft,
      now,
    });

    expect(handoff.id).toBeTruthy();
    expect(handoff.device_id).toBe(DEMO_DEVICE_ID);
    expect(handoff.source_log_count).toBe(2);
    expect(handoff.copy_text).toBeTruthy();
    expect(handoff.created_at).toBe(now.toISOString());
  });
});
