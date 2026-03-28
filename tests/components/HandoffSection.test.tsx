import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HandoffSection } from "@/components/handoff/HandoffSection";

describe("HandoffSection", () => {
  it("renders a title and list of items", () => {
    render(
      <HandoffSection
        title="Keep in mind"
        items={["May wake soon", "Soothing may help before the next feed"]}
      />,
    );

    expect(screen.getByText("Keep in mind")).toBeInTheDocument();
    expect(screen.getByText("May wake soon")).toBeInTheDocument();
    expect(screen.getByText("Soothing may help before the next feed")).toBeInTheDocument();
  });

  it("renders an optional caption", () => {
    render(
      <HandoffSection
        title="Why this summary"
        caption="Grounded in the recent notes only."
        items={["Last feed: 40m ago"]}
      />,
    );

    expect(screen.getByText("Grounded in the recent notes only.")).toBeInTheDocument();
  });

  it("does not render a caption when not provided", () => {
    render(
      <HandoffSection
        title="Test section"
        items={["Item one"]}
      />,
    );

    expect(screen.queryByText("Grounded")).not.toBeInTheDocument();
  });
});
