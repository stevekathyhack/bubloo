"use client";

import { CurrentStateCard } from "./CurrentStateCard";
import { BublooShell } from "./BublooShell";
import { useBubloo } from "./BublooProvider";

export function NowTab() {
  const { currentState, isHydrated } = useBubloo();

  return (
    <BublooShell activeTab="now">
      <header className="screen-header baby-header">
        <img
          src="/baby.jpeg"
          alt="Harry"
          className="baby-photo"
        />
        <h1 className="screen-title">Harry</h1>
      </header>

      <CurrentStateCard isHydrated={isHydrated} state={currentState} />
    </BublooShell>
  );
}
