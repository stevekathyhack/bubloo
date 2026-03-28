import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BublooProvider } from "@/components/BublooProvider";
import { QuickActions } from "@/components/QuickActions";
import { DEVICE_STORAGE_KEY } from "@/lib/bubloo/constants";

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

describe("QuickActions", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders all five quick action entries", async () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");

    render(
      <BublooProvider>
        <QuickActions />
      </BublooProvider>,
    );

    expect(await screen.findByText("Feed")).toBeInTheDocument();
    expect(screen.getByText("Sleep")).toBeInTheDocument();
    expect(screen.getByText("Wake")).toBeInTheDocument();
    expect(screen.getByText("Diaper")).toBeInTheDocument();
    expect(screen.getByText("Add Note")).toBeInTheDocument();
  });

  it("saves a one-tap sleep log and shows feedback", async () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");
    const user = userEvent.setup();

    render(
      <BublooProvider>
        <QuickActions />
      </BublooProvider>,
    );

    const sleepButton = await screen.findByText("Sleep");
    await user.click(sleepButton);

    await waitFor(() => {
      expect(screen.getByText("Sleep saved just now.")).toBeInTheDocument();
    });
  });

  it("saves a one-tap diaper log and shows feedback", async () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");
    const user = userEvent.setup();

    render(
      <BublooProvider>
        <QuickActions />
      </BublooProvider>,
    );

    const diaperButton = await screen.findByText("Diaper");
    await user.click(diaperButton);

    await waitFor(() => {
      expect(screen.getByText("Diaper saved just now.")).toBeInTheDocument();
    });
  });

  it("links Feed to /log?type=feeding", async () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");

    render(
      <BublooProvider>
        <QuickActions />
      </BublooProvider>,
    );

    const feedLink = await screen.findByText("Feed");
    const anchor = feedLink.closest("a");
    expect(anchor).toHaveAttribute("href", "/log?type=feeding");
  });

  it("links Add Note to /log?type=note", async () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");

    render(
      <BublooProvider>
        <QuickActions />
      </BublooProvider>,
    );

    const noteLink = await screen.findByText("Add Note");
    const anchor = noteLink.closest("a");
    expect(anchor).toHaveAttribute("href", "/log?type=note");
  });
});
