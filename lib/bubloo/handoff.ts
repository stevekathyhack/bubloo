import { randomUUID } from "crypto";
import OpenAI from "openai";
import { DEMO_DEVICE_ID } from "./constants";
import { formatElapsedDuration, formatRelativeTime } from "./time";
import { getRecentCareLogs, readPersistedCareLogs, getSeedLogs, saveHandoffRecord } from "./store";
import type { CareLogEntry, Handoff, HandoffDraft } from "./types";

const CARE_LOG_TYPES = new Set(["feeding", "sleep_start", "wake", "diaper", "note"]);

const HANDOFF_SCHEMA = {
  type: "object",
  properties: {
    headline: {
      type: "string",
      minLength: 1,
    },
    summary_text: {
      type: "string",
      minLength: 1,
    },
    keep_in_mind_today: {
      type: "array",
      items: {
        type: "string",
        minLength: 1,
      },
      minItems: 2,
      maxItems: 3,
    },
    why_this_summary: {
      type: "array",
      items: {
        type: "string",
        minLength: 1,
      },
      minItems: 2,
      maxItems: 3,
    },
    suggested_next_step: {
      type: "string",
      minLength: 1,
    },
  },
  required: [
    "headline",
    "summary_text",
    "keep_in_mind_today",
    "why_this_summary",
    "suggested_next_step",
  ],
  additionalProperties: false,
} as const;

const DEVELOPER_PROMPT = `You are Bubloo's calm handoff engine.

Your job is to read sparse baby-care logs and produce a caregiver-ready handoff.

Rules:
- Write in a calm, warm, low-anxiety tone
- Never give medical advice or diagnoses
- Never invent facts not supported by logs or notes
- Focus on what the next caregiver should know now
- Keep the output brief and mobile-friendly
- "What to keep in mind today" should be practical and gentle
- "Suggested next step" must be a single, non-medical action
- "Why this summary" should show 2-3 source-context items in plain language

Return valid JSON only.`;

function uniqueStrings(values: string[], fallback: string[]): string[] {
  const cleaned = [...values, ...fallback]
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);

  return cleaned.slice(0, 3);
}

function findLatest(logs: CareLogEntry[], type: CareLogEntry["type"]): CareLogEntry | null {
  return logs.find((log) => log.type === type) ?? null;
}

function getSleepContext(logs: CareLogEntry[]) {
  const lastSleepStart = findLatest(logs, "sleep_start");
  const lastWake = findLatest(logs, "wake");

  const isSleeping =
    !!lastSleepStart &&
    (!lastWake ||
      new Date(lastSleepStart.timestamp).getTime() >
        new Date(lastWake.timestamp).getTime());

  return {
    isSleeping,
    lastSleepStart,
    lastWake,
  };
}

function lowerFirst(text: string): string {
  if (!text) {
    return text;
  }

  return text.charAt(0).toLowerCase() + text.slice(1);
}

function normalizeNote(text?: string | null): string | null {
  if (!text) {
    return null;
  }

  const cleaned = text.trim();
  if (!cleaned) {
    return null;
  }

  return cleaned.endsWith(".") ? cleaned.slice(0, -1) : cleaned;
}

function sentenceJoin(parts: string[]): string {
  if (parts.length === 0) {
    return "";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }

  return `${parts.slice(0, -1).join(", ")}, and ${parts.at(-1)}`;
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

function totalSleepMinutes(logs: CareLogEntry[], now: Date): number {
  const starts = logs.filter((l) => l.type === "sleep_start")
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const wakes = logs.filter((l) => l.type === "wake")
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  let total = 0;
  for (const s of starts) {
    const sTime = new Date(s.timestamp).getTime();
    const w = wakes.find((w) => new Date(w.timestamp).getTime() > sTime);
    total += Math.round(((w ? new Date(w.timestamp).getTime() : now.getTime()) - sTime) / 60_000);
  }
  return total;
}

function dailySleepAvgMinutes(history: CareLogEntry[], now: Date): number {
  if (history.length === 0) return 0;
  const oldest = new Date(history[history.length - 1].timestamp).getTime();
  const days = Math.max(1, Math.round((now.getTime() - oldest) / (24 * 60 * 60_000)));
  const total = totalSleepMinutes(history, now);
  return Math.round(total / days);
}

function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function buildFallbackHandoffDraft(
  recentLogs: CareLogEntry[],
  now = new Date(),
  allLogs?: CareLogEntry[],
): HandoffDraft {
  const all = allLogs ?? recentLogs;
  const { today, history } = splitByDay(all, now);
  const logs = today.length > 0 ? today : recentLogs;

  const recentNote = findLatest(logs, "note");
  const { isSleeping, lastSleepStart } = getSleepContext(logs);
  const normalizedNote = normalizeNote(recentNote?.note);

  if (logs.length === 0) {
    return {
      headline: "Bubloo update",
      summary_text:
        "There are only a few notes so far, but this is enough to start a calm handoff.",
      keep_in_mind_today: [
        "A small next note will still help the next caregiver.",
        "Missing logs are okay here.",
      ],
      why_this_summary: ["Recent logs are still sparse.", "This handoff stayed close to what is known."],
      suggested_next_step: "Start with a calm check-in and add the next small note when it helps.",
    };
  }

  // --- Feeding analysis (today vs 3-day avg) ---
  const todayAvgMl = avgFeedMl(logs);
  const histAvgMl = avgFeedMl(history);
  const feedDiff = histAvgMl > 0 ? histAvgMl - todayAvgMl : 0;

  // --- Sleep analysis (today vs daily avg) ---
  const todaySleepMin = totalSleepMinutes(logs, now);
  const histDailySleepMin = dailySleepAvgMinutes(history, now);
  // Scale historical daily avg to 8h window for fair comparison
  const histWindowSleepMin = histDailySleepMin > 0 ? Math.round(histDailySleepMin / 3) : 0;
  const sleepDiffMin = histWindowSleepMin > 0 ? Math.max(0, histWindowSleepMin - todaySleepMin) : 0;

  const summaryParts: string[] = [];

  // Feeding
  if (todayAvgMl > 0 && feedDiff > 10) {
    summaryParts.push(
      `Feeding intake is ${feedDiff} mL lower than the 3-day average (${todayAvgMl} mL vs. usual ${histAvgMl} mL).`,
    );
  } else if (todayAvgMl > 0 && histAvgMl > 0) {
    summaryParts.push(
      `Feeding intake is on track at ${todayAvgMl} mL per feed (3-day avg: ${histAvgMl} mL).`,
    );
  } else if (todayAvgMl > 0) {
    summaryParts.push(`Latest feed was ${todayAvgMl} mL.`);
  }

  // Sleep
  if (sleepDiffMin > 15) {
    summaryParts.push(
      `Sleep is about ${fmtDuration(sleepDiffMin)} less than usual in this window (${fmtDuration(todaySleepMin)} vs. avg ${fmtDuration(histWindowSleepMin)}).`,
    );
  } else if (todaySleepMin > 0 && histWindowSleepMin > 0) {
    summaryParts.push(
      `Sleep is within the normal range (${fmtDuration(todaySleepMin)} in this window).`,
    );
  }

  // Note
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
    keepInMind.push(`Sleep deficit of ~${fmtDuration(sleepDiffMin)} compared to the recent pattern — baby may be overtired.`);
  }
  if (isSleeping && lastSleepStart) {
    keepInMind.push(`Currently asleep for ${formatElapsedDuration(lastSleepStart.timestamp, now)}.`);
  }
  if (normalizedNote) {
    keepInMind.push(normalizedNote);
  }

  const whyThisSummary: string[] = [];
  if (todayAvgMl > 0) {
    whyThisSummary.push(`Today avg feed: ${todayAvgMl} mL${histAvgMl > 0 ? ` (3-day avg: ${histAvgMl} mL)` : ""}`);
  }
  if (todaySleepMin > 0) {
    whyThisSummary.push(`Sleep this window: ${fmtDuration(todaySleepMin)}${histWindowSleepMin > 0 ? ` (avg: ${fmtDuration(histWindowSleepMin)})` : ""}`);
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

function safeString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => safeString(entry))
    .filter((entry): entry is string => Boolean(entry));
}

export function mergeWithFallbackDraft(
  rawDraft: unknown,
  fallbackDraft: HandoffDraft,
): HandoffDraft {
  const raw = typeof rawDraft === "object" && rawDraft !== null ? rawDraft : {};
  const source = raw as Record<string, unknown>;

  return {
    headline: safeString(source.headline) ?? fallbackDraft.headline,
    summary_text: safeString(source.summary_text) ?? fallbackDraft.summary_text,
    keep_in_mind_today: uniqueStrings(
      safeStringArray(source.keep_in_mind_today),
      fallbackDraft.keep_in_mind_today,
    ),
    why_this_summary: uniqueStrings(
      safeStringArray(source.why_this_summary),
      fallbackDraft.why_this_summary,
    ),
    suggested_next_step:
      safeString(source.suggested_next_step) ?? fallbackDraft.suggested_next_step,
  };
}

export function buildCopyText(draft: HandoffDraft): string {
  return [
    `${draft.headline}`,
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

export function createPersistedHandoff({
  deviceId = DEMO_DEVICE_ID,
  logs,
  draft,
  now = new Date(),
}: {
  deviceId?: string;
  logs: CareLogEntry[];
  draft: HandoffDraft;
  now?: Date;
}): Handoff {
  return {
    id: randomUUID(),
    device_id: deviceId,
    headline: draft.headline,
    summary_text: draft.summary_text,
    keep_in_mind_today: draft.keep_in_mind_today.slice(0, 3),
    why_this_summary: draft.why_this_summary.slice(0, 3),
    suggested_next_step: draft.suggested_next_step,
    copy_text: buildCopyText(draft),
    source_log_count: logs.length,
    created_at: now.toISOString(),
  };
}

export function normalizeLogsForPrompt(logs: CareLogEntry[], now = new Date()): string {
  if (logs.length === 0) {
    return "No logs were found in the last 8 hours.";
  }

  return logs
    .map((log) => {
      const parts = [
        `${formatRelativeTime(log.timestamp, now)}`,
        log.type,
        log.amount_ml ? `${log.amount_ml} mL` : null,
        normalizeNote(log.note),
      ].filter(Boolean);

      return `- ${parts.join(" | ")}`;
    })
    .join("\n");
}

function isCareLogEntry(candidate: unknown): candidate is CareLogEntry {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof (candidate as CareLogEntry).id === "string" &&
    typeof (candidate as CareLogEntry).device_id === "string" &&
    typeof (candidate as CareLogEntry).type === "string" &&
    CARE_LOG_TYPES.has((candidate as CareLogEntry).type) &&
    typeof (candidate as CareLogEntry).timestamp === "string" &&
    typeof (candidate as CareLogEntry).created_at === "string"
  );
}

function normalizeSourceLogs(
  logs: CareLogEntry[] | undefined,
  deviceId: string,
  now: Date,
): CareLogEntry[] {
  if (!logs || logs.length === 0) {
    return [];
  }

  const windowStart = now.getTime() - 8 * 60 * 60 * 1000;

  return logs
    .filter(isCareLogEntry)
    .filter((log) => {
      const timestamp = new Date(log.timestamp).getTime();
      return timestamp >= windowStart && timestamp <= now.getTime();
    })
    .map((log) => ({
      ...log,
      device_id: deviceId,
    }))
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    )
    .slice(0, 20);
}

async function requestCodexDraft(
  logs: CareLogEntry[],
  now = new Date(),
): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: process.env.OPENAI_HANDOFF_MODEL ?? "gpt-5.2-codex",
    input: `${DEVELOPER_PROMPT}\n\nRecent logs from the last 8 hours:\n${normalizeLogsForPrompt(
      logs,
      now,
    )}`,
    text: {
      format: {
        type: "json_schema",
        name: "bubloo_handoff",
        strict: true,
        schema: HANDOFF_SCHEMA,
      },
    },
  });

  if (!response.output_text) {
    throw new Error("Codex returned an empty handoff payload.");
  }

  return JSON.parse(response.output_text);
}

export async function generateAndPersistHandoff(
  deviceId = DEMO_DEVICE_ID,
  sourceLogs?: CareLogEntry[],
): Promise<Handoff> {
  const now = new Date();
  const normalizedSourceLogs = normalizeSourceLogs(sourceLogs, deviceId, now);
  const logs =
    normalizedSourceLogs.length > 0
      ? normalizedSourceLogs
      : await getRecentCareLogs({
          deviceId,
          range: "8h",
          limit: 20,
          offset: 0,
          now,
        });
  // Fetch all historical logs for comparison
  let allLogs: CareLogEntry[];
  try {
    const persisted = await readPersistedCareLogs();
    const deviceLogs = persisted.filter((l) => l.device_id === deviceId);
    allLogs = deviceLogs.length > 0 ? deviceLogs : getSeedLogs(now, deviceId);
  } catch {
    allLogs = logs;
  }

  const fallbackDraft = buildFallbackHandoffDraft(logs, now, allLogs);

  let draft = fallbackDraft;

  try {
    const rawDraft = await requestCodexDraft(logs, now);
    draft = mergeWithFallbackDraft(rawDraft, fallbackDraft);
  } catch (error) {
    console.error("Falling back to local handoff draft.", error);
  }

  const handoff = createPersistedHandoff({
    deviceId,
    logs,
    draft,
    now,
  });

  try {
    await saveHandoffRecord(handoff);
  } catch (error) {
    console.error("Unable to persist handoff record.", error);
  }

  return handoff;
}
