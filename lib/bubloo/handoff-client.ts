import { buildCurrentState } from "@/lib/domain/current-state";
import { filterLogsWithinHours, sortLogsByTimestamp } from "@/lib/domain/logs";
import { formatRelativeTime } from "@/lib/domain/time";
import type { CareLogEntry } from "@/lib/domain/types";
import type { Handoff, HandoffDraft } from "./types";

const HANDOFF_WINDOW_HOURS = 8;

function findLatest(logs: CareLogEntry[], type: CareLogEntry["type"]): CareLogEntry | null {
  return logs.find((log) => log.type === type) ?? null;
}

function normalizeNote(text?: string | null): string | null {
  if (!text) return null;
  const cleaned = text.trim();
  if (!cleaned) return null;
  return cleaned.endsWith(".") ? cleaned.slice(0, -1) : cleaned;
}

function lowerFirst(text: string): string {
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

function sentenceJoin(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts.at(-1)}`;
}

function uniqueStrings(values: string[], fallback: string[]): string[] {
  return [...values, ...fallback]
    .map((v) => v.trim())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3);
}

function splitByDay(allLogs: CareLogEntry[], now: Date) {
  const todayStart = now.getTime() - 8 * 60 * 60_000;
  const today = allLogs.filter((l) => new Date(l.timestamp).getTime() >= todayStart);
  const history = allLogs.filter((l) => new Date(l.timestamp).getTime() < todayStart);
  return { today, history };
}

function avgFeedMl(logs: CareLogEntry[]): number {
  const feeds = logs.filter((l) => l.type === "feeding" && l.amount_ml && l.amount_ml > 0);
  if (feeds.length === 0) return 0;
  return Math.round(feeds.reduce((sum, f) => sum + (f.amount_ml ?? 0), 0) / feeds.length);
}

function calcTotalSleepMinutes(logs: CareLogEntry[], now: Date): number {
  const starts = logs.filter((l) => l.type === "sleep_start")
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const wakes = logs.filter((l) => l.type === "wake")
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  let total = 0;
  for (const s of starts) {
    const sTime = new Date(s.timestamp).getTime();
    const w = wakes.find((wk) => new Date(wk.timestamp).getTime() > sTime);
    total += Math.round(((w ? new Date(w.timestamp).getTime() : now.getTime()) - sTime) / 60_000);
  }
  return total;
}

function dailySleepAvgMin(history: CareLogEntry[], now: Date): number {
  if (history.length === 0) return 0;
  const oldest = new Date(history[history.length - 1].timestamp).getTime();
  const days = Math.max(1, Math.round((now.getTime() - oldest) / (24 * 60 * 60_000)));
  return Math.round(calcTotalSleepMinutes(history, now) / days);
}

function fmtDur(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function buildClientDraft(allLogs: CareLogEntry[], now: Date): HandoffDraft {
  const { today, history } = splitByDay(allLogs, now);
  const logs = today.length > 0 ? today : allLogs;

  const recentNote = findLatest(logs, "note");
  const lastSleepStart = findLatest(logs, "sleep_start");
  const lastWake = findLatest(logs, "wake");

  const isSleeping =
    !!lastSleepStart &&
    (!lastWake || new Date(lastSleepStart.timestamp).getTime() > new Date(lastWake.timestamp).getTime());

  const normalizedNote = normalizeNote(recentNote?.note);

  if (logs.length === 0) {
    return {
      headline: "Bubloo update",
      summary_text: "There are only a few notes so far, but this is enough to start a calm handoff.",
      keep_in_mind_today: [
        "A small next note will still help the next caregiver.",
        "Missing logs are okay here.",
      ],
      why_this_summary: ["Recent logs are still sparse.", "This handoff stayed close to what is known."],
      suggested_next_step: "Start with a calm check-in and add the next small note when it helps.",
    };
  }

  const todayAvgMl = avgFeedMl(logs);
  const histAvgMl = avgFeedMl(history);
  const feedDiff = histAvgMl > 0 ? histAvgMl - todayAvgMl : 0;

  const todaySleepMin = calcTotalSleepMinutes(logs, now);
  const histDailySleepMin = dailySleepAvgMin(history, now);
  const histWindowSleepMin = histDailySleepMin > 0 ? Math.round(histDailySleepMin / 3) : 0;
  const sleepDiffMin = histWindowSleepMin > 0 ? Math.max(0, histWindowSleepMin - todaySleepMin) : 0;

  const summaryParts: string[] = [];

  if (todayAvgMl > 0 && feedDiff > 10) {
    summaryParts.push(
      `Feeding intake is ${feedDiff} mL lower than the 3-day average (${todayAvgMl} mL vs. usual ${histAvgMl} mL).`,
    );
  } else if (todayAvgMl > 0 && histAvgMl > 0) {
    summaryParts.push(`Feeding intake is on track at ${todayAvgMl} mL per feed (3-day avg: ${histAvgMl} mL).`);
  } else if (todayAvgMl > 0) {
    summaryParts.push(`Latest feed was ${todayAvgMl} mL.`);
  }

  if (sleepDiffMin > 15) {
    summaryParts.push(
      `Sleep is about ${fmtDur(sleepDiffMin)} less than usual in this window (${fmtDur(todaySleepMin)} vs. avg ${fmtDur(histWindowSleepMin)}).`,
    );
  } else if (todaySleepMin > 0 && histWindowSleepMin > 0) {
    summaryParts.push(`Sleep is within the normal range (${fmtDur(todaySleepMin)} in this window).`);
  }

  if (normalizedNote) {
    summaryParts.push(`Behavioral note: "${normalizedNote}."`);
  }

  const summaryText =
    summaryParts.length > 0
      ? summaryParts.join(" ")
      : "A few recent notes give the next caregiver a calm starting point.";

  const keepInMind: string[] = [];
  if (feedDiff > 10 && histAvgMl > 0) {
    keepInMind.push(`Feeding is ${feedDiff} mL below the 3-day average of ${histAvgMl} mL — may want to offer again soon.`);
  }
  if (sleepDiffMin > 15) {
    keepInMind.push(`Sleep deficit of ~${fmtDur(sleepDiffMin)} compared to the recent pattern — baby may be overtired.`);
  }
  if (isSleeping && lastSleepStart) {
    keepInMind.push(`Currently asleep for ${formatRelativeTime(lastSleepStart.timestamp, now).toLowerCase()}.`);
  }
  if (normalizedNote) {
    keepInMind.push(normalizedNote);
  }

  const whyThisSummary: string[] = [];
  if (todayAvgMl > 0) {
    whyThisSummary.push(`Today avg feed: ${todayAvgMl} mL${histAvgMl > 0 ? ` (3-day avg: ${histAvgMl} mL)` : ""}`);
  }
  if (todaySleepMin > 0) {
    whyThisSummary.push(`Sleep this window: ${fmtDur(todaySleepMin)}${histWindowSleepMin > 0 ? ` (avg: ${fmtDur(histWindowSleepMin)})` : ""}`);
  }
  return {
    headline: "Bubloo update",
    summary_text: summaryText,
    keep_in_mind_today: uniqueStrings(keepInMind, [
      "A few small notes can still be enough today.",
      "This handoff stayed close to the latest logs.",
    ]),
    why_this_summary: uniqueStrings(whyThisSummary, [
      "This handoff focused on the latest recent logs.",
      "Only details supported by the notes were included.",
    ]),
    suggested_next_step: isSleeping
      ? "Let baby rest for now, and do a calm check-in when they wake."
      : "Start with a calm check-in and use the latest note to guide the next handoff.",
  };
}

function buildCopyText(draft: HandoffDraft): string {
  return [
    draft.headline,
    draft.summary_text,
    "",
    "What to keep in mind today:",
    ...draft.keep_in_mind_today.map((item) => `- ${item}`),
    "",
    "Suggested next step:",
    draft.suggested_next_step,
    "",
    "Why this summary:",
    ...draft.why_this_summary.map((item) => `- ${item}`),
  ].join("\n");
}

function localId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildClientHandoff(
  allLogs: CareLogEntry[],
  deviceId: string,
  now = new Date(),
): Handoff {
  const recentLogs = sortLogsByTimestamp(
    filterLogsWithinHours(allLogs, HANDOFF_WINDOW_HOURS, now),
    "desc",
  );

  const draft = buildClientDraft(allLogs, now);

  return {
    id: `local-${localId()}`,
    device_id: deviceId,
    headline: draft.headline,
    summary_text: draft.summary_text,
    keep_in_mind_today: draft.keep_in_mind_today.slice(0, 3),
    why_this_summary: draft.why_this_summary.slice(0, 3),
    suggested_next_step: draft.suggested_next_step,
    copy_text: buildCopyText(draft),
    source_log_count: recentLogs.length,
    created_at: now.toISOString(),
  };
}
