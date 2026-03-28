import { formatClockTime, formatRelativeTime } from "@/lib/domain/time";

describe("formatRelativeTime", () => {
  const now = new Date("2026-03-28T14:30:00.000Z");

  it("returns a soft just-now label for very recent times", () => {
    expect(formatRelativeTime("2026-03-28T14:29:40.000Z", now)).toBe("Just now");
  });

  it("returns minute-based labels for recent events", () => {
    expect(formatRelativeTime("2026-03-28T14:05:00.000Z", now)).toBe("25m ago");
  });

  it("returns hour-based labels for older events", () => {
    expect(formatRelativeTime("2026-03-28T12:25:00.000Z", now)).toBe("2h ago");
  });

  it("supports future timestamps for optimistic client state", () => {
    expect(formatRelativeTime("2026-03-28T14:45:00.000Z", now)).toBe("in 15m");
  });
});

describe("formatClockTime", () => {
  it("returns a soft clock label for glanceable UI surfaces", () => {
    expect(formatClockTime("2026-03-28T14:05:00.000Z")).toMatch(/^\d{1,2}:\d{2} [AP]M$/);
  });
});
