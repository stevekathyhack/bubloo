import type { ReactNode } from "react";

import { BottomTabBar, type BublooTabId } from "./BottomTabBar";
import { IconCloud } from "./icons";

export function BublooShell({
  activeTab,
  children,
}: {
  activeTab: BublooTabId;
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <main className="screen-frame">
        <div className="top-bar">
          <div className="top-bar-brand">
            <IconCloud size={24} />
            <span className="top-bar-wordmark">Bubloo</span>
          </div>
        </div>
        {children}
        <BottomTabBar activeTab={activeTab} />
      </main>
    </div>
  );
}
