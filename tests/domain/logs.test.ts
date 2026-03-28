import { createCareLogEntry, filterLogsWithinHours } from "@/lib/domain/logs";
import type { CareLogEntry } from "@/lib/domain/types";

describe("createCareLogEntry", () => {
  const now = new Date("2026-03-28T14:30:00.000Z");

  it("rounds valid feed amounts and trims note text", () => {
    const entry = createCareLogEntry({
      deviceId: "device-1",
      input: {
        type: "feeding",
        amount_ml: 119.6,
        note: "  Calm after burping.  ",
      },
      now,
    });

    expect(entry).toMatchObject({
      device_id: "device-1",
      type: "feeding",
      amount_ml: 120,
      note: "Calm after burping.",
      timestamp: "2026-03-28T14:30:00.000Z",
      created_at: "2026-03-28T14:30:00.000Z",
    });
  });

  it("falls back to now when given an invalid timestamp", () => {
    const entry = createCareLogEntry({
      deviceId: "device-1",
      input: {
        type: "note",
        timestamp: "not-a-real-time",
        note: "A short note",
      },
      now,
    });

    expect(entry.timestamp).toBe("2026-03-28T14:30:00.000Z");
  });
});

describe("filterLogsWithinHours", () => {
  const now = new Date("2026-03-28T14:30:00.000Z");

  it("drops invalid timestamps instead of leaking broken data into recent views", () => {
    const logs: CareLogEntry[] = [
      {
        id: "valid",
        device_id: "device-1",
        type: "feeding",
        timestamp: "2026-03-28T14:00:00.000Z",
        amount_ml: 120,
        note: null,
        created_at: "2026-03-28T14:00:00.000Z",
      },
      {
        id: "invalid",
        device_id: "device-1",
        type: "note",
        timestamp: "bad-time",
        amount_ml: null,
        note: "Broken",
        created_at: "2026-03-28T14:01:00.000Z",
      },
    ];

    expect(filterLogsWithinHours(logs, 6, now)).toEqual([logs[0]]);
  });
});
