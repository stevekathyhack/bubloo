import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TimelineEventCard } from "@/components/timeline/TimelineEventCard";
import type { CareLogEntry } from "@/lib/bubloo/types";

describe("TimelineEventCard", () => {
  const baseLog: CareLogEntry = {
    id: "log-1",
    device_id: "device-1",
    type: "feeding",
    timestamp: new Date(Date.now() - 40 * 60_000).toISOString(),
    amount_ml: 120,
    created_at: new Date(Date.now() - 40 * 60_000).toISOString(),
  };

  it("renders the log type label", () => {
    render(<TimelineEventCard log={baseLog} />);

    expect(screen.getByText("Feed")).toBeInTheDocument();
  });

  it("renders a note log with its text", () => {
    const noteLog: CareLogEntry = {
      ...baseLog,
      id: "log-note",
      type: "note",
      amount_ml: undefined,
      note: "A little fussy before falling asleep",
    };

    render(<TimelineEventCard log={noteLog} />);

    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("A little fussy before falling asleep")).toBeInTheDocument();
  });

  it("renders sleep_start type correctly", () => {
    const sleepLog: CareLogEntry = {
      ...baseLog,
      id: "log-sleep",
      type: "sleep_start",
      amount_ml: undefined,
    };

    render(<TimelineEventCard log={sleepLog} />);

    expect(screen.getByText("Sleep")).toBeInTheDocument();
  });

  it("renders diaper type correctly", () => {
    const diaperLog: CareLogEntry = {
      ...baseLog,
      id: "log-diaper",
      type: "diaper",
      amount_ml: undefined,
    };

    render(<TimelineEventCard log={diaperLog} />);

    expect(screen.getByText("Diaper")).toBeInTheDocument();
  });
});
