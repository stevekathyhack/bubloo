import { render, screen } from "@testing-library/react";

import { TimelineList } from "@/components/timeline/TimelineList";
import { buildDemoSeedLogs } from "@/lib/domain/seed";

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

describe("TimelineList", () => {
  it("renders recent logs with a handoff CTA", () => {
    const logs = buildDemoSeedLogs(new Date("2026-03-28T14:30:00.000Z"));

    render(<TimelineList logs={logs} />);

    expect(screen.getByText("Create handoff")).toBeInTheDocument();
    expect(screen.getByText("Feed")).toBeInTheDocument();
    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("A little fussy before falling asleep")).toBeInTheDocument();
  });
});
