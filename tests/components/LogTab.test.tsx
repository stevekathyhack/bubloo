import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BublooProvider } from "@/components/BublooProvider";
import { LogTab } from "@/components/LogTab";
import { DEVICE_STORAGE_KEY } from "@/lib/bubloo/constants";

let currentSearch = "";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("LogTab", () => {
  beforeEach(() => {
    currentSearch = "";
    window.localStorage.clear();
  });

  it("renders the Quick log header and subtitle", () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");

    render(
      <BublooProvider>
        <LogTab />
      </BublooProvider>,
    );

    expect(screen.getByText("Quick log")).toBeInTheDocument();
    expect(
      screen.getByText("Capture a small moment in your little one\u2019s day."),
    ).toBeInTheDocument();
  });

  it("renders all five type selector buttons", () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");

    render(
      <BublooProvider>
        <LogTab />
      </BublooProvider>,
    );

    expect(screen.getByRole("button", { name: "Feed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sleep" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wake" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Diaper" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Note" })).toBeInTheDocument();
  });

  it("shows the reassurance footer text", () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");

    render(
      <BublooProvider>
        <LogTab />
      </BublooProvider>,
    );

    expect(
      screen.getByText("You\u2019re doing a wonderful job today."),
    ).toBeInTheDocument();
  });

  it("shows optional amount field when Feed is selected", () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");

    render(
      <BublooProvider>
        <LogTab />
      </BublooProvider>,
    );

    expect(screen.getByLabelText("Amount (ml)")).toBeInTheDocument();
  });

  it("shows textarea when Note is selected", async () => {
    currentSearch = "type=note";
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");

    render(
      <BublooProvider>
        <LogTab />
      </BublooProvider>,
    );

    expect(await screen.findByLabelText("Note")).toBeInTheDocument();
  });

  it("saves a one-tap diaper log from the Log tab", async () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");
    const user = userEvent.setup();

    render(
      <BublooProvider>
        <LogTab />
      </BublooProvider>,
    );

    const diaperChip = screen.getByRole("button", { name: "Diaper" });
    await user.click(diaperChip);

    const saveButton = await screen.findByRole("button", { name: "Save diaper now" });

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });

    await user.click(saveButton);

    expect(screen.getByText("Diaper saved just now.")).toBeInTheDocument();
  });
});
