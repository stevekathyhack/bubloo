"use client";

import { BublooShell } from "./BublooShell";
import { LogComposer } from "./LogComposer";

export function LogTab() {
  return (
    <BublooShell activeTab="log">
      <header className="screen-header">
        <h1 className="screen-title">Quick log</h1>
        <p className="screen-subtitle">
          Capture a small moment in your little one{"\u2019"}s day.
        </p>
      </header>

      <LogComposer />

      <p className="reassurance">
        You{"\u2019"}re doing a wonderful job today.
      </p>
    </BublooShell>
  );
}
