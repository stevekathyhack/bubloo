export const CARE_LOG_TYPES = ["feeding", "sleep_start", "wake", "diaper", "note"] as const;

export type CareLogType = (typeof CARE_LOG_TYPES)[number];

export interface CareLogEntry {
  id: string;
  device_id: string;
  type: CareLogType;
  timestamp: string;
  amount_ml?: number | null;
  note?: string | null;
  created_at: string;
}

export interface CreateCareLogInput {
  type: CareLogType;
  timestamp?: string;
  amount_ml?: number | null;
  note?: string | null;
}

export interface CurrentStateEvent {
  timestamp: string;
  relative_text: string;
}

export interface CurrentStateResponse {
  lastFeed: (CurrentStateEvent & {
    amount_ml: number | null;
  }) | null;
  sleepStatusText: string;
  lastDiaper: CurrentStateEvent | null;
  recentNote: {
    timestamp: string;
    note: string;
  } | null;
  reassuranceText: string;
}

export interface HandoffDraft {
  headline: string;
  summary_text: string;
  keep_in_mind_today: string[];
  why_this_summary: string[];
  suggested_next_step: string;
}

export interface Handoff extends HandoffDraft {
  id: string;
  device_id: string;
  copy_text?: string | null;
  source_log_count: number;
  created_at: string;
}

export interface AppClientState {
  deviceId: string | null;
  currentState: CurrentStateResponse | null;
  latestHandoff: Handoff | null;
  activeTab: 0 | 1 | 2 | 3;
}

export interface SleepStatusResult {
  state: "asleep" | "awake" | "unknown";
  text: string;
  latestSleepStart: CareLogEntry | null;
  latestWake: CareLogEntry | null;
}

export interface HandoffPromptLog {
  id: string;
  type: CareLogType;
  timestamp: string;
  relative_text: string;
  amount_ml: number | null;
  note: string | null;
}

export interface HandoffPromptInput {
  generatedAt: string;
  windowHours: number;
  sourceLogCount: number;
  currentState: CurrentStateResponse;
  recentLogs: HandoffPromptLog[];
  recentNotes: string[];
}
