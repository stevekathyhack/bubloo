import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TimelineRangeControls } from "@/components/timeline/TimelineRangeControls";

describe("TimelineRangeControls", () => {
  it("renders 3h, 6h, and 8h range buttons", () => {
    render(<TimelineRangeControls value="6h" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "3h" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "6h" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "8h" })).toBeInTheDocument();
  });

  it("marks the active range as pressed", () => {
    render(<TimelineRangeControls value="3h" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "3h" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "6h" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange when a different range is selected", async () => {
    const onChange = vi.fn();
    render(<TimelineRangeControls value="6h" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "8h" }));
    expect(onChange).toHaveBeenCalledWith("8h");
  });

  it("disables all buttons when disabled prop is true", () => {
    render(<TimelineRangeControls value="6h" onChange={vi.fn()} disabled />);

    expect(screen.getByRole("button", { name: "3h" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "6h" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "8h" })).toBeDisabled();
  });
});
