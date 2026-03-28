import Link from "next/link";

import { IconSun, IconPlus, IconTimeline, IconHandoff } from "./icons";

export type BublooTabId = "now" | "log" | "timeline" | "handoff";

const TABS = [
  { key: "now" as const, label: "Now", href: "/", Icon: IconSun },
  { key: "log" as const, label: "Log", href: "/log", Icon: IconPlus },
  { key: "timeline" as const, label: "Timeline", href: "/timeline", Icon: IconTimeline },
  { key: "handoff" as const, label: "Handoff", href: "/handoff", Icon: IconHandoff },
];

export function BottomTabBar({
  activeTab,
}: {
  activeTab: BublooTabId;
}) {
  return (
    <nav className="tab-bar" aria-label="Primary navigation">
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const className = isActive ? "tab-link tab-link-active" : "tab-link";

        return (
          <Link
            key={tab.key}
            aria-current={isActive ? "page" : undefined}
            className={className}
            href={tab.href}
          >
            <tab.Icon className="tab-icon" size={20} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
