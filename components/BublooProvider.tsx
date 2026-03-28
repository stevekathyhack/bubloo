"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import {
  CARE_LOG_TYPES,
  type CareLogEntry,
  type CreateCareLogInput,
  type CurrentStateResponse,
} from "@/lib/domain/types";
import {
  buildCurrentState,
  buildDemoSeedLogs,
  createCareLogEntry,
  isValidTimestamp,
  sortLogsByTimestamp,
} from "@/lib/domain";
import { ensureDeviceId } from "@/lib/bubloo/device";
import { DEFAULT_REASSURANCE_TEXT, EMPTY_SLEEP_STATUS_TEXT } from "@/lib/domain/constants";

const LOG_STORAGE_KEY = "bubloo-demo-care-logs";

interface BublooContextValue {
  deviceId: string | null;
  logs: CareLogEntry[];
  currentState: CurrentStateResponse;
  isHydrated: boolean;
  addLog: (input: CreateCareLogInput) => CareLogEntry | null;
}

const BublooContext = createContext<BublooContextValue | null>(null);

const EMPTY_CURRENT_STATE: CurrentStateResponse = {
  lastFeed: null,
  sleepStatusText: EMPTY_SLEEP_STATUS_TEXT,
  lastDiaper: null,
  recentNote: null,
  reassuranceText: DEFAULT_REASSURANCE_TEXT,
};

function isCareLogType(value: string): value is CareLogEntry["type"] {
  return CARE_LOG_TYPES.some((type) => type === value);
}

function parseStoredLogs(rawValue: string | null) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return sortLogsNewestFirst(
      parsedValue.filter((candidate): candidate is CareLogEntry => {
        return (
          candidate != null &&
          typeof candidate === "object" &&
          typeof candidate.id === "string" &&
          typeof candidate.device_id === "string" &&
          typeof candidate.type === "string" &&
          isCareLogType(candidate.type) &&
          typeof candidate.timestamp === "string" &&
          isValidTimestamp(candidate.timestamp) &&
          typeof candidate.created_at === "string" &&
          isValidTimestamp(candidate.created_at)
        );
      }),
    );
  } catch {
    return [];
  }
}

function sortLogsNewestFirst(logs: CareLogEntry[]) {
  return sortLogsByTimestamp(logs, "desc");
}

async function syncLogsToServer(deviceId: string, logs: CareLogEntry[]) {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const response = await fetch("/api/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      device_id: deviceId,
      logs,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to sync Bubloo logs.");
  }
}

async function loadLogsFromServer(deviceId: string): Promise<CareLogEntry[] | null> {
  if (process.env.NODE_ENV === "test") {
    return null;
  }

  const search = new URLSearchParams({
    device_id: deviceId,
    range: "8h",
    limit: "50",
    offset: "0",
  });
  const response = await fetch(`/api/logs?${search.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load Bubloo logs.");
  }

  const payload = (await response.json()) as {
    logs?: CareLogEntry[];
  };

  return Array.isArray(payload.logs) ? sortLogsNewestFirst(payload.logs) : null;
}

export function BublooProvider({ children }: { children: ReactNode }) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [logs, setLogs] = useState<CareLogEntry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const lastSyncedSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function hydrate() {
      const nextDeviceId = ensureDeviceId();
      const storedLogs = parseStoredLogs(window.localStorage.getItem(LOG_STORAGE_KEY));
      let nextLogs = storedLogs;

      if (nextLogs.length === 0) {
        try {
          const serverLogs = await loadLogsFromServer(nextDeviceId);
          nextLogs =
            serverLogs && serverLogs.length > 0
              ? serverLogs
              : buildDemoSeedLogs(new Date(), nextDeviceId);
        } catch (error) {
          console.error("Unable to load Bubloo logs from the server.", error);
          nextLogs = buildDemoSeedLogs(new Date(), nextDeviceId);
        }
      }

      if (storedLogs.length === 0) {
        window.localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(nextLogs));
      }

      try {
        await syncLogsToServer(nextDeviceId, nextLogs);
        lastSyncedSignatureRef.current = `${nextDeviceId}:${JSON.stringify(nextLogs)}`;
      } catch (error) {
        console.error("Unable to sync Bubloo logs during hydration.", error);
      }

      if (!isActive) {
        return;
      }

      setDeviceId(nextDeviceId);
      setLogs(nextLogs);
      setIsHydrated(true);
    }

    void hydrate();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || !deviceId) {
      return;
    }

    window.localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));

    const signature = `${deviceId}:${JSON.stringify(logs)}`;
    if (lastSyncedSignatureRef.current === signature) {
      return;
    }

    void syncLogsToServer(deviceId, logs)
      .then(() => {
        lastSyncedSignatureRef.current = signature;
      })
      .catch((error) => {
        console.error("Unable to sync Bubloo logs.", error);
      });
  }, [deviceId, isHydrated, logs]);

  const currentState = isHydrated ? buildCurrentState(logs) : EMPTY_CURRENT_STATE;

  function addLog(input: CreateCareLogInput) {
    if (!deviceId) {
      return null;
    }

    const entry = createCareLogEntry({ deviceId, input });
    setLogs((previousLogs) => sortLogsNewestFirst([entry, ...previousLogs]));
    return entry;
  }

  return (
    <BublooContext.Provider
      value={{
        deviceId,
        logs,
        currentState,
        isHydrated,
        addLog,
      }}
    >
      {children}
    </BublooContext.Provider>
  );
}

export function useBubloo() {
  const context = useContext(BublooContext);

  if (!context) {
    throw new Error("useBubloo must be used inside BublooProvider.");
  }

  return context;
}
