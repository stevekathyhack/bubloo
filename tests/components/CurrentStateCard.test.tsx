import { render, screen } from "@testing-library/react";

import { CurrentStateCard } from "@/components/CurrentStateCard";
import { EMPTY_SLEEP_STATUS_TEXT } from "@/lib/domain/constants";
import { buildCurrentState } from "@/lib/domain/current-state";
import { buildDemoSeedLogs } from "@/lib/domain/seed";

describe("CurrentStateCard", () => {
  const now = new Date("2026-03-28T14:30:00.000Z");

  it("renders the calm, glanceable current state from recent logs", () => {
    const state = buildCurrentState(buildDemoSeedLogs(now), now);

    render(<CurrentStateCard isHydrated state={state} />);

    expect(screen.getByText("Current state")).toBeInTheDocument();
    expect(screen.getByText("120 ml 40m ago")).toBeInTheDocument();
    expect(screen.getByText("Asleep for 25m")).toBeInTheDocument();
    expect(screen.getByText("55m ago")).toBeInTheDocument();
    expect(screen.getByText(/A little fussy before falling asleep/)).toBeInTheDocument();
  });

  it("shows the warm empty-state copy when there is no recent signal", () => {
    render(
      <CurrentStateCard
        isHydrated
        state={{
          lastFeed: null,
          sleepStatusText: EMPTY_SLEEP_STATUS_TEXT,
          lastDiaper: null,
          recentNote: null,
          reassuranceText: "Today, this is enough.",
        }}
      />,
    );

    expect(
      screen.getByText("Even a couple of notes can be enough to make the next handoff easier."),
    ).toBeInTheDocument();
  });
});
