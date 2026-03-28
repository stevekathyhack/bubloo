import { buildCurrentState, deriveSleepStatus } from "@/lib/domain/current-state";
import { createMockCareLogs } from "@/lib/testing/mock-data";

describe("deriveSleepStatus", () => {
  const now = new Date("2026-03-28T14:30:00.000Z");

  it("reports asleep when the latest sleep event is sleep_start", () => {
    const logs = createMockCareLogs(
      [
        { type: "feeding", minutesAgo: 40, amount_ml: 120 },
        { type: "sleep_start", minutesAgo: 25 },
      ],
      now,
    );

    expect(deriveSleepStatus(logs, now)).toMatchObject({
      state: "asleep",
      text: "Asleep for 25m",
    });
  });

  it("reports awake when the latest sleep event is wake", () => {
    const logs = createMockCareLogs(
      [
        { type: "sleep_start", minutesAgo: 90 },
        { type: "wake", minutesAgo: 40 },
      ],
      now,
    );

    expect(deriveSleepStatus(logs, now)).toMatchObject({
      state: "awake",
      text: "Woke 40m ago",
    });
  });

  it("stays gentle when there are no recent sleep logs", () => {
    const logs = createMockCareLogs([{ type: "feeding", minutesAgo: 20, amount_ml: 90 }], now);

    expect(deriveSleepStatus(logs, now)).toMatchObject({
      state: "unknown",
      text: "No recent sleep notes yet.",
    });
  });
});

describe("buildCurrentState", () => {
  const now = new Date("2026-03-28T14:30:00.000Z");

  it("builds the calm current-state response from recent logs", () => {
    const logs = createMockCareLogs(
      [
        { type: "feeding", minutesAgo: 40, amount_ml: 120 },
        { type: "diaper", minutesAgo: 55 },
        { type: "note", minutesAgo: 30, note: "A little fussy before falling asleep" },
        { type: "sleep_start", minutesAgo: 25 },
        { type: "feeding", minutesAgo: 390, amount_ml: 60 },
      ],
      now,
    );

    expect(buildCurrentState(logs, now)).toEqual({
      lastFeed: {
        timestamp: "2026-03-28T13:50:00.000Z",
        amount_ml: 120,
        relative_text: "40m ago",
      },
      sleepStatusText: "Asleep for 25m",
      lastDiaper: {
        timestamp: "2026-03-28T13:35:00.000Z",
        relative_text: "55m ago",
      },
      recentNote: {
        timestamp: "2026-03-28T14:00:00.000Z",
        note: "A little fussy before falling asleep",
      },
      reassuranceText: "Today, this is enough.",
    });
  });

  it("uses the latest note text even when it came from a non-note log", () => {
    const logs = createMockCareLogs(
      [
        { type: "feeding", minutesAgo: 18, amount_ml: 100, note: "Settled better after a short burp break." },
        { type: "diaper", minutesAgo: 45 },
      ],
      now,
    );

    expect(buildCurrentState(logs, now).recentNote).toEqual({
      timestamp: "2026-03-28T14:12:00.000Z",
      note: "Settled better after a short burp break.",
    });
  });

  it("returns calm empty values when the recent window is blank", () => {
    const logs = createMockCareLogs([{ type: "feeding", minutesAgo: 500, amount_ml: 120 }], now);

    expect(buildCurrentState(logs, now)).toEqual({
      lastFeed: null,
      sleepStatusText: "No recent sleep notes yet.",
      lastDiaper: null,
      recentNote: null,
      reassuranceText: "Today, this is enough.",
    });
  });
});
