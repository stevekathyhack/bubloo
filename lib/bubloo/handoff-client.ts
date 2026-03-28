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

function buildClientDraft(logs: CareLogEntry[], now: Date): HandoffDraft {
  const lastFeed = findLatest(logs, "feeding");
  const lastDiaper = findLatest(logs, "diaper");
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

  const summaryFacts: string[] = [];
  if (lastFeed) summaryFacts.push("a recent feed was logged");
  if (lastDiaper) summaryFacts.push("a diaper change was logged");
  if (isSleeping) summaryFacts.push("baby is now asleep");
  else if (lastWake) summaryFacts.push("baby is awake right now");

  const core = sentenceJoin(summaryFacts);
  const summaryText =
    core.length > 0
      ? `${core.charAt(0).toUpperCase()}${core.slice(1)}.${
          normalizedNote ? ` A recent note mentioned ${lowerFirst(normalizedNote)}.` : ""
        }`
      : normalizedNote
        ? `A recent note mentioned ${lowerFirst(normalizedNote)}.`
        : "A few recent notes give the next caregiver a calm starting point.";

  const keepInMind: string[] = [];
  if (normalizedNote) keepInMind.push(normalizedNote);
  if (isSleeping && lastSleepStart) {
    keepInMind.push(`Sleeping since ${formatRelativeTime(lastSleepStart.timestamp, now).toLowerCase()}.`);
  } else if (lastWake) {
    keepInMind.push(`Awake since ${formatRelativeTime(lastWake.timestamp, now).toLowerCase()}.`);
  }
  if (lastFeed) keepInMind.push(`Last feed was ${formatRelativeTime(lastFeed.timestamp, now).toLowerCase()}.`);

  const whyThisSummary: string[] = [];
  if (lastFeed) whyThisSummary.push(`Last feed: ${formatRelativeTime(lastFeed.timestamp, now)}`);
  if (lastSleepStart) whyThisSummary.push(`Sleep started: ${formatRelativeTime(lastSleepStart.timestamp, now)}`);
  else if (lastWake) whyThisSummary.push(`Last wake: ${formatRelativeTime(lastWake.timestamp, now)}`);
  if (normalizedNote) whyThisSummary.push(`Recent note: ${lowerFirst(normalizedNote)}`);
  else if (lastDiaper) whyThisSummary.push(`Last diaper: ${formatRelativeTime(lastDiaper.timestamp, now)}`);

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

  const draft = buildClientDraft(recentLogs, now);

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
