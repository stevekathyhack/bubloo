import type { CareLogType } from "@/lib/domain/types";

export const APP_NAME = "Bubloo";
export const CURRENT_STATE_WINDOW_HOURS = 6;
export const HANDOFF_WINDOW_HOURS = 8;
export const DEFAULT_REASSURANCE_TEXT = "Today, this is enough.";
export const EMPTY_SLEEP_STATUS_TEXT = "No recent sleep notes yet.";
export const DEFAULT_HANDOFF_HEADLINE = "Bubloo update";

export const CARE_LOG_TYPE_LABELS: Record<CareLogType, string> = {
  feeding: "Feed",
  sleep_start: "Sleep",
  wake: "Wake",
  diaper: "Diaper",
  note: "Note",
};
