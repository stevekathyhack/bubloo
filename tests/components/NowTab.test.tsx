import { render, screen } from "@testing-library/react";

import { BublooProvider } from "@/components/BublooProvider";
import { NowTab } from "@/components/NowTab";
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

describe("NowTab", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the header with Bubloo wordmark and subcopy", async () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");

    render(
      <BublooProvider>
        <NowTab />
      </BublooProvider>,
    );

    expect(screen.getByRole("heading", { name: "Harry" })).toBeInTheDocument();
  });

  it("renders the current state card section", () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");

    render(
      <BublooProvider>
        <NowTab />
      </BublooProvider>,
    );

    expect(screen.getByText("Current state")).toBeInTheDocument();
  });

  it("renders quick action entries for all five log types", async () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");

    render(
      <BublooProvider>
        <NowTab />
      </BublooProvider>,
    );

    await screen.findByText("Current state");

    expect(screen.getByText("Feed")).toBeInTheDocument();
    expect(screen.getByText("Sleep")).toBeInTheDocument();
    expect(screen.getByText("Wake")).toBeInTheDocument();
    expect(screen.getByText("Diaper")).toBeInTheDocument();
    expect(screen.getByText("Add Note")).toBeInTheDocument();
  });

  it("does not contain timeline preview or create-handoff CTA", async () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");

    render(
      <BublooProvider>
        <NowTab />
      </BublooProvider>,
    );

    await screen.findByText("Current state");

    expect(screen.queryByText("Create handoff")).not.toBeInTheDocument();
    expect(screen.queryByText("Open handoff")).not.toBeInTheDocument();
  });

  it("renders without reassurance text on screen", () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "test-device");

    render(
      <BublooProvider>
        <NowTab />
      </BublooProvider>,
    );

    expect(screen.queryByText("Today, this is enough.")).not.toBeInTheDocument();
  });
});
