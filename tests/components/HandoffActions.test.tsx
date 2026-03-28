import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HandoffActions } from "@/components/handoff/HandoffActions";

describe("HandoffActions", () => {
  it("renders copy and refresh buttons", () => {
    render(
      <HandoffActions
        onCopy={vi.fn()}
        onRefresh={vi.fn()}
        pending={false}
        copied={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Copy handoff" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh summary" })).toBeInTheDocument();
  });

  it("disables buttons while pending", () => {
    render(
      <HandoffActions
        onCopy={vi.fn()}
        onRefresh={vi.fn()}
        pending={true}
        copied={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Copy handoff" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Refresh summary" })).toBeDisabled();
  });

  it("shows copied confirmation in button text", () => {
    render(
      <HandoffActions
        onCopy={vi.fn()}
        onRefresh={vi.fn()}
        pending={false}
        copied={true}
      />,
    );

    expect(screen.getByRole("button", { name: "Copied!" })).toBeInTheDocument();
  });

  it("calls onCopy when copy button is clicked", async () => {
    const onCopy = vi.fn();
    render(
      <HandoffActions
        onCopy={onCopy}
        onRefresh={vi.fn()}
        pending={false}
        copied={false}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Copy handoff" }));
    expect(onCopy).toHaveBeenCalledOnce();
  });

  it("calls onRefresh when refresh button is clicked", async () => {
    const onRefresh = vi.fn();
    render(
      <HandoffActions
        onCopy={vi.fn()}
        onRefresh={onRefresh}
        pending={false}
        copied={false}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Refresh summary" }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });
});
