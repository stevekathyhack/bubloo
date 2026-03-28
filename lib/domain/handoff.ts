import { DEFAULT_HANDOFF_HEADLINE, HANDOFF_WINDOW_HOURS } from "@/lib/domain/constants";
import { buildCurrentState } from "@/lib/domain/current-state";
import { filterLogsWithinHours, getTrimmedNote, sortLogsByTimestamp } from "@/lib/domain/logs";
import { formatRelativeTime } from "@/lib/domain/time";
import type { CareLogEntry, HandoffDraft, HandoffPromptInput } from "@/lib/domain/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Handoff response field "${fieldName}" must be a non-empty string.`);
  }

  return value.trim();
}

function readRequiredStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Handoff response field "${fieldName}" must be an array of strings.`);
  }

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (items.length === 0) {
    throw new Error(`Handoff response field "${fieldName}" must include at least one string.`);
  }

  return items;
}

function extractJsonPayload(raw: string): unknown {
  const trimmed = raw.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const jsonCandidate = fencedMatch?.[1] ?? trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1);

  if (!jsonCandidate || !jsonCandidate.trim()) {
    throw new Error("Handoff response did not contain a JSON object.");
  }

  try {
    return JSON.parse(jsonCandidate);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Unable to parse handoff JSON: ${error.message}`
        : "Unable to parse handoff JSON.",
    );
  }
}

export function buildHandoffPromptInput(logs: CareLogEntry[], now: Date = new Date()): HandoffPromptInput {
  const recentLogs = sortLogsByTimestamp(filterLogsWithinHours(logs, HANDOFF_WINDOW_HOURS, now), "asc");
  const recentNotes = recentLogs
    .map((log) => getTrimmedNote(log))
    .filter((note): note is string => Boolean(note));

  return {
    generatedAt: now.toISOString(),
    windowHours: HANDOFF_WINDOW_HOURS,
    sourceLogCount: recentLogs.length,
    currentState: buildCurrentState(logs, now),
    recentLogs: recentLogs.map((log) => ({
      id: log.id,
      type: log.type,
      timestamp: log.timestamp,
      relative_text: formatRelativeTime(log.timestamp, now),
      amount_ml: log.amount_ml ?? null,
      note: getTrimmedNote(log),
    })),
    recentNotes: Array.from(new Set(recentNotes)),
  };
}

export function parseHandoffResponse(raw: string | Record<string, unknown>): HandoffDraft {
  const parsed = typeof raw === "string" ? extractJsonPayload(raw) : raw;

  if (!isRecord(parsed)) {
    throw new Error("Handoff response must be a JSON object.");
  }

  return {
    headline: typeof parsed.headline === "string" && parsed.headline.trim() ? parsed.headline.trim() : DEFAULT_HANDOFF_HEADLINE,
    summary_text: readRequiredString(parsed.summary_text, "summary_text"),
    keep_in_mind_today: readRequiredStringArray(parsed.keep_in_mind_today, "keep_in_mind_today"),
    why_this_summary: readRequiredStringArray(parsed.why_this_summary, "why_this_summary"),
    suggested_next_step: readRequiredString(parsed.suggested_next_step, "suggested_next_step"),
  };
}
