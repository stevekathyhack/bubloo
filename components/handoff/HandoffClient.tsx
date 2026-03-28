"use client";

import { useEffect, useRef, useState } from "react";

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
  const response = await fetch(`/api/handoff/latest?device_id=${deviceId}`, {
    cache: "no-store",
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as LatestHandoffResponse;
  return payload.handoff ?? null;
}

export function HandoffClient() {
  const { deviceId, isHydrated, logs } = useBubloo();
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "refreshing" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const lastLoadKeyRef = useRef<string | null>(null);

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

      // Try server-side generation (sends logs so server has data)
      try {
        const generated = await requestHandoff(deviceId!, logs);
        if (isActive) {
          setHandoff(generated);
          setStatus("ready");
          return;
        }
      } catch {
        // Server failed — fall back to client-side generation
      }

      if (!isActive) return;

      // Client-side fallback — always works
      const fallback = buildClientHandoff(logs, deviceId!);
      setHandoff(fallback);
      setStatus("ready");
    }

    void loadHandoff();
    return () => {
      isActive = false;
    };
  }, [deviceId, isHydrated, logs]);

  async function refresh() {
    if (!deviceId) return;

    setStatus("refreshing");
    setError(null);
    setCopied(false);

    try {
      const generated = await requestHandoff(deviceId, logs);
      setHandoff(generated);
      setStatus("ready");
    } catch {
      // Fallback to client-side
      const fallback = buildClientHandoff(logs, deviceId);
      setHandoff(fallback);
      setStatus("ready");
    }
  }

  async function handleCopy() {
    if (!handoff?.copy_text) return;

    try {
      await navigator.clipboard.writeText(handoff.copy_text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback for environments where clipboard API is blocked
      try {
        const textarea = document.createElement("textarea");
        textarea.value = handoff.copy_text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      } catch {
        setError("Copying did not work just now.");
      }
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
