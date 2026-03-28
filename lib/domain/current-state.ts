import {
  CURRENT_STATE_WINDOW_HOURS,
  DEFAULT_REASSURANCE_TEXT,
  EMPTY_SLEEP_STATUS_TEXT,
} from "@/lib/domain/constants";
import { filterLogsWithinHours, getTrimmedNote, sortLogsByTimestamp, toDate } from "@/lib/domain/logs";
import { formatRelativeTime } from "@/lib/domain/time";
import type { CareLogEntry, CurrentStateResponse, SleepStatusResult } from "@/lib/domain/types";

function formatElapsedShort(timestamp: Date | string, now: Date): string {
  const elapsedMinutes = Math.max(0, Math.floor((now.getTime() - toDate(timestamp).getTime()) / 60000));

  if (elapsedMinutes < 1) {
    return "a moment";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m`;
  }

  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

export function deriveSleepStatus(logs: CareLogEntry[], now: Date = new Date()): SleepStatusResult {
  const recentSleepStart = sortLogsByTimestamp(
    logs.filter((log) => log.type === "sleep_start"),
    "desc",
  )[0] ?? null;

  const recentWake = sortLogsByTimestamp(
    logs.filter((log) => log.type === "wake"),
    "desc",
  )[0] ?? null;

  const latestSleepEvent = sortLogsByTimestamp(
    logs.filter((log) => log.type === "sleep_start" || log.type === "wake"),
    "desc",
  )[0] ?? null;

  if (!latestSleepEvent) {
    return {
      state: "unknown",
      text: EMPTY_SLEEP_STATUS_TEXT,
      latestSleepStart: recentSleepStart,
      latestWake: recentWake,
    };
  }

  if (latestSleepEvent.type === "sleep_start") {
    return {
      state: "asleep",
      text: `Asleep for ${formatElapsedShort(latestSleepEvent.timestamp, now)}`,
      latestSleepStart: recentSleepStart,
      latestWake: recentWake,
    };
  }

  return {
    state: "awake",
    text: `Woke ${formatRelativeTime(latestSleepEvent.timestamp, now).toLowerCase()}`,
    latestSleepStart: recentSleepStart,
    latestWake: recentWake,
  };
}

export function buildCurrentState(logs: CareLogEntry[], now: Date = new Date()): CurrentStateResponse {
  const recentLogs = sortLogsByTimestamp(filterLogsWithinHours(logs, CURRENT_STATE_WINDOW_HOURS, now), "desc");

  const lastFeed = recentLogs.find((log) => log.type === "feeding") ?? null;
  const lastDiaper = recentLogs.find((log) => log.type === "diaper") ?? null;
  const latestNoteLog = recentLogs.find((log) => getTrimmedNote(log)) ?? null;

  return {
    lastFeed: lastFeed
      ? {
          timestamp: lastFeed.timestamp,
          amount_ml: lastFeed.amount_ml ?? null,
          relative_text: formatRelativeTime(lastFeed.timestamp, now),
        }
      : null,
    sleepStatusText: deriveSleepStatus(recentLogs, now).text,
    lastDiaper: lastDiaper
      ? {
          timestamp: lastDiaper.timestamp,
          relative_text: formatRelativeTime(lastDiaper.timestamp, now),
        }
      : null,
    recentNote: latestNoteLog
      ? {
          timestamp: latestNoteLog.timestamp,
          note: getTrimmedNote(latestNoteLog) as string,
        }
      : null,
    reassuranceText: DEFAULT_REASSURANCE_TEXT,
  };
}
