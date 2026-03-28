import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BublooProvider } from "@/components/BublooProvider";
import { LogComposer } from "@/components/LogComposer";

let currentSearch = "";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

describe("LogComposer", () => {
  beforeEach(() => {
    currentSearch = "";
    window.localStorage.clear();
  });

  it("requires note text before saving a note", async () => {
    currentSearch = "type=note";
    const user = userEvent.setup();

    render(
      <BublooProvider>
        <LogComposer />
      </BublooProvider>,
    );

    const noteField = await screen.findByLabelText("Note");
    const saveButton = screen.getByRole("button", { name: "Save log" });

    expect(saveButton).toBeDisabled();

    await user.type(noteField, "Settled after rocking.");

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });

    await user.click(saveButton);

    expect(screen.getByText("Note saved just now.")).toBeInTheDocument();

    const savedLogs = JSON.parse(
      window.localStorage.getItem("bubloo-demo-care-logs") ?? "[]",
    ) as Array<{ note?: string; type?: string }>;

    expect(savedLogs[0]).toMatchObject({
      type: "note",
      note: "Settled after rocking.",
    });
  });

  it("supports near one-tap wake logging", async () => {
    currentSearch = "type=wake";
    const user = userEvent.setup();

    render(
      <BublooProvider>
        <LogComposer />
      </BublooProvider>,
    );

    const saveButton = await screen.findByRole("button", { name: "Save wake now" });

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });

    await user.click(saveButton);

    expect(screen.getByText("Wake saved just now.")).toBeInTheDocument();
  });
});
