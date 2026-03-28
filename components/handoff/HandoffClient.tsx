"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BublooShell } from "@/components/BublooShell";
import { useBubloo } from "@/components/BublooProvider";
import { SoftStateCard } from "@/components/SoftStateCard";
import { buildClientHandoff } from "@/lib/bubloo/handoff-client";

import type { Handoff, LatestHandoffResponse } from "../../lib/bubloo/types";
import { HandoffPanel } from "./HandoffPanel";

async function requestHandoff(deviceId: string, logs: unknown[]): Promise<Handoff> {
  const response = await fetch("/api/handoff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device_id: deviceId, logs }),
  });

  if (!response.ok) {
    throw new Error("Handoff generation request failed.");
  }

  return (await response.json()) as Handoff;
}

async function fetchLatestHandoff(deviceId: string): Promise<Handoff | null> {
  const params = new URLSearchParams({ device_id: deviceId });
  const response = await fetch(`/api/handoff/latest?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as LatestHandoffResponse;
  return payload.handoff ?? null;
}

const CAREGIVERS = ["Mother", "Father", "Nanny", "Grandma", "Grandpa"] as const;

export function HandoffClient() {
  const { deviceId, isHydrated, logs } = useBubloo();
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "refreshing" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const lastLoadKeyRef = useRef<string | null>(null);
  const [toCaregiver, setToCaregiver] = useState<string>("Mother");
  const [showPicker, setShowPicker] = useState(false);

  const selectCaregiver = useCallback((name: string) => {
    setToCaregiver(name);
    setShowPicker(false);
  }, []);

  useEffect(() => {
    if (!isHydrated || !deviceId) {
      return;
    }

    const loadKey = `${deviceId}:${logs[0]?.timestamp ?? "none"}:${logs.length}`;
    if (lastLoadKeyRef.current === loadKey) {
      return;
    }

    lastLoadKeyRef.current = loadKey;
    let isActive = true;

    async function loadHandoff() {
      setStatus("loading");
      setError(null);

      // Try fetching latest persisted handoff first
      try {
        const latest = await fetchLatestHandoff(deviceId!);
        const latestLogTs = logs[0]?.timestamp;
        const isFresh =
          latest &&
          (!latestLogTs ||
            new Date(latest.created_at).getTime() >= new Date(latestLogTs).getTime());

        if (isFresh && isActive) {
          setHandoff(latest);
          setStatus("ready");
          return;
        }
      } catch {
        // Continue to generation
      }

      if (!isActive) return;

      // Use client-side generation with full log history for comparison
      const generated = buildClientHandoff(logs, deviceId!);
      setHandoff(generated);
      setStatus("ready");
    }

    void loadHandoff();
    return () => {
      isActive = false;
    };
  }, [deviceId, isHydrated, logs]);

  function refresh() {
    if (!deviceId) return;

    setStatus("refreshing");
    setError(null);
    setCopied(false);

    const generated = buildClientHandoff(logs, deviceId);
    setHandoff(generated);
    setStatus("ready");
  }

  async function handleCopy() {
    if (!handoff?.copy_text) return;

    try {
      await navigator.clipboard.writeText(handoff.copy_text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setError("Long-press the summary text to copy it manually.");
    }
  }

  return (
    <BublooShell activeTab="handoff">
      <header className="screen-header">
        <h1 className="screen-title" style={{ fontStyle: "italic" }}>Handoff</h1>
        <p className="screen-subtitle">
          Codex turned recent notes into a calm handoff
        </p>
      </header>

      <div className="handoff-to-section">
        <button
          type="button"
          className="handoff-to-badge"
          onClick={() => setShowPicker(!showPicker)}
        >
          <span>to <strong>{toCaregiver}</strong></span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="handoff-to-chevron">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {showPicker ? (
          <div className="handoff-picker">
            {CAREGIVERS.map((name) => (
              <button
                key={name}
                type="button"
                className={`handoff-picker-option${name === toCaregiver ? " handoff-picker-option--active" : ""}`}
                onClick={() => selectCaregiver(name)}
              >
                <div className="handoff-picker-avatar">{name.charAt(0)}</div>
                {name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {(!isHydrated || status === "loading") && !handoff ? (
        <div className="loading-shimmer" />
      ) : null}

      {handoff ? (
        <HandoffPanel
          handoff={handoff}
          pending={status === "loading" || status === "refreshing"}
          copied={copied}
          onCopy={handleCopy}
          onRefresh={() => void refresh()}
          fromCaregiver={{ name: "Nanny" }}
        />
      ) : null}

      {status === "error" && !handoff ? (
        <SoftStateCard
          title="The handoff is taking a moment"
          body={error ?? "Please try refreshing in a moment."}
        />
      ) : null}
    </BublooShell>
  );
}
