import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HandoffSummaryCard } from "@/components/handoff/HandoffSummaryCard";
import type { Handoff } from "@/lib/bubloo/types";

describe("HandoffSummaryCard", () => {
  const handoff: Handoff = {
    id: "handoff-1",
    device_id: "device-1",
    headline: "Bubloo update",
    summary_text:
      "A recent feed and diaper change were logged, and baby is now asleep.",
    keep_in_mind_today: ["May wake soon", "Soothing may help"],
    why_this_summary: ["Last feed: 40m ago", "Sleep started: 25m ago"],
    suggested_next_step: "Let baby rest for now.",
    copy_text: "copy text here",
    source_log_count: 4,
    created_at: "2026-03-28T19:00:00.000Z",
  };

  it("renders the headline and summary text", () => {
    render(<HandoffSummaryCard handoff={handoff} />);

    expect(screen.getByText("Bubloo update")).toBeInTheDocument();
    expect(
      screen.getByText(
        "A recent feed and diaper change were logged, and baby is now asleep.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the sparkle icon alongside the headline", () => {
    render(<HandoffSummaryCard handoff={handoff} />);

    const headline = screen.getByText("Bubloo update");
    const container = headline.parentElement;
    expect(container?.querySelector("svg")).toBeInTheDocument();
  });

  it("uses the featured card surface", () => {
    const { container } = render(<HandoffSummaryCard handoff={handoff} />);

    expect(container.querySelector(".surface-card--featured")).toBeInTheDocument();
  });

  it("renders with different headline text", () => {
    render(<HandoffSummaryCard handoff={{ ...handoff, headline: "Morning calm" }} />);

    expect(screen.getByText("Morning calm")).toBeInTheDocument();
  });
});
