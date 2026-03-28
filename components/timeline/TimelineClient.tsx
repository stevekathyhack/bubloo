"use client";

import { useEffect, useMemo, useState } from "react";

import { BublooShell } from "@/components/BublooShell";
import { useBubloo } from "@/components/BublooProvider";
import { SoftStateCard } from "@/components/SoftStateCard";
import { filterLogsWithinHours, sortLogsByTimestamp } from "@/lib/domain/logs";

import type { TimelineRange, TimelineResponse } from "../../lib/bubloo/types";
import { TimelineList } from "./TimelineList";
import { TimelineRangeControls } from "./TimelineRangeControls";

const RANGE_TO_HOURS: Record<TimelineRange, number> = {
  "12h": 12,
  "24h": 24,
  "48h": 48,
};

export function TimelineClient() {
  const { deviceId, logs, isHydrated } = useBubloo();
  const [range, setRange] = useState<TimelineRange>("24h");
  const [remoteLogs, setRemoteLogs] = useState<TimelineResponse["logs"]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const fallbackLogs = useMemo(() => {
    const recentLogs = filterLogsWithinHours(logs, RANGE_TO_HOURS[range]);
    return sortLogsByTimestamp(recentLogs, "desc");
  }, [logs, range]);

  useEffect(() => {
    if (!isHydrated || !deviceId) {
      return;
    }

    const currentDeviceId = deviceId;
    const controller = new AbortController();

    async function loadTimeline() {
      setStatus("loading");
      setError(null);

      try {
        const search = new URLSearchParams({
          device_id: currentDeviceId,
          range,
          limit: "50",
          offset: "0",
        });
        const response = await fetch(`/api/logs?${search.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Timeline request failed.");
        }

        const payload = (await response.json()) as TimelineResponse;
        setRemoteLogs(payload.logs);
        setStatus("ready");
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(loadError);
        setError("The latest notes are taking a moment, so Bubloo is showing what is already on this device.");
        setRemoteLogs(fallbackLogs);
        setStatus("error");
      }
    }

    void loadTimeline();
    return () => controller.abort();
  }, [deviceId, fallbackLogs, isHydrated, range]);

  const visibleLogs = status === "ready" ? remoteLogs : fallbackLogs;

  return (
    <BublooShell activeTab="timeline">
      <header className="screen-header">
        <h1 className="screen-title">Timeline</h1>
        <p className="screen-subtitle">
          Every small moment, softly archived.
        </p>
      </header>

      <TimelineRangeControls
        value={range}
        onChange={setRange}
        disabled={!isHydrated || status === "loading"}
      />

      {!isHydrated || (status === "loading" && visibleLogs.length === 0) ? (
        <SoftStateCard
          title="Pulling in the latest notes"
          body="Bubloo is gathering the last few hours so the next handoff feels grounded."
        />
      ) : null}

      {status === "error" ? (
        <SoftStateCard
          title="Using the notes already on this device"
          body={error ?? "The latest timeline request is taking a moment."}
        />
      ) : null}

      {isHydrated && visibleLogs.length === 0 ? (
        <SoftStateCard
          title="A few notes are enough to start"
          body="Once the first small event is logged, it will land here in reverse order."
        />
      ) : null}

      {visibleLogs.length > 0 ? <TimelineList logs={visibleLogs} /> : null}
    </BublooShell>
  );
}
