import { buildClientHandoff } from "@/lib/bubloo/handoff-client";
import { buildDemoSeedLogs } from "@/lib/domain/seed";
import { createMockCareLogs } from "@/lib/testing/mock-data";

describe("buildClientHandoff", () => {
  const now = new Date("2026-03-28T14:30:00.000Z");
  const deviceId = "device-test";

  it("produces a complete handoff from the demo seed logs", () => {
    const logs = buildDemoSeedLogs(now, deviceId);
    const handoff = buildClientHandoff(logs, deviceId, now);

    expect(handoff.device_id).toBe(deviceId);
    expect(handoff.headline).toBe("Bubloo update");
    expect(handoff.summary_text).toBeTruthy();
    expect(handoff.keep_in_mind_today.length).toBeGreaterThanOrEqual(2);
    expect(handoff.keep_in_mind_today.length).toBeLessThanOrEqual(3);
    expect(handoff.why_this_summary.length).toBeGreaterThanOrEqual(2);
    expect(handoff.why_this_summary.length).toBeLessThanOrEqual(3);
    expect(handoff.suggested_next_step).toBeTruthy();
    expect(handoff.copy_text).toContain("What to keep in mind today:");
    expect(handoff.source_log_count).toBe(logs.length);
    expect(handoff.id).toMatch(/^local-/);
  });

  it("produces a calm handoff even with no logs", () => {
    const handoff = buildClientHandoff([], deviceId, now);

    expect(handoff.summary_text).toBeTruthy();
    expect(handoff.keep_in_mind_today.length).toBeGreaterThanOrEqual(2);
    expect(handoff.suggested_next_step).toBeTruthy();
    expect(handoff.source_log_count).toBe(0);
  });

  it("reflects note text in the handoff summary", () => {
    const logs = createMockCareLogs(
      [
        { type: "feeding", minutesAgo: 40, amount_ml: 120 },
        { type: "note", minutesAgo: 30, note: "A little fussy before falling asleep" },
        { type: "sleep_start", minutesAgo: 25 },
      ],
      now,
    );

    const handoff = buildClientHandoff(logs, deviceId, now);

    expect(handoff.summary_text).toContain("fussy");
    expect(handoff.keep_in_mind_today.some((item) => item.includes("fussy"))).toBe(true);
  });

  it("detects sleeping state in the suggested next step", () => {
    const logs = createMockCareLogs(
      [
        { type: "feeding", minutesAgo: 40 },
        { type: "sleep_start", minutesAgo: 10 },
      ],
      now,
    );

    const handoff = buildClientHandoff(logs, deviceId, now);

    expect(handoff.suggested_next_step).toContain("rest");
  });

  it("works with sparse logs (2-3 only)", () => {
    const logs = createMockCareLogs(
      [
        { type: "feeding", minutesAgo: 60, amount_ml: 90 },
        { type: "diaper", minutesAgo: 45 },
      ],
      now,
    );

    const handoff = buildClientHandoff(logs, deviceId, now);

    expect(handoff.summary_text).toBeTruthy();
    expect(handoff.source_log_count).toBe(2);
    expect(handoff.why_this_summary.length).toBeGreaterThanOrEqual(2);
  });
});
