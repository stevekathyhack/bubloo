import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HandoffPanel } from "../components/handoff/HandoffPanel";
import type { Handoff } from "../lib/bubloo/types";

describe("handoff panel", () => {
  it("renders the calm handoff sections", () => {
    const handoff: Handoff = {
      id: "handoff-1",
      device_id: "device-1",
      headline: "Bubloo update",
      summary_text:
        "A recent feed and diaper change were logged, and baby is now asleep.",
      keep_in_mind_today: [
        "A little fussy before falling asleep",
        "Sleeping for about 25m so far.",
      ],
      why_this_summary: [
        "Last feed: 40m ago",
        "Sleep started: 25m ago",
      ],
      suggested_next_step:
        "Let baby rest for now, and do a calm check-in when they wake.",
      copy_text: "copy",
      source_log_count: 4,
      created_at: "2026-03-28T19:00:00.000Z",
    };

    render(
      <HandoffPanel
        handoff={handoff}
        pending={false}
        copied={false}
        onCopy={vi.fn()}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText("Bubloo update")).toBeInTheDocument();
    expect(screen.getByText("Keep in mind")).toBeInTheDocument();
    expect(screen.getByText("Suggested next step")).toBeInTheDocument();
    expect(screen.getByText("Why this summary")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy handoff" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Refresh summary" }),
    ).toBeInTheDocument();
  });
});
