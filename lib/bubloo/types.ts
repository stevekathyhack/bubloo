export type CareLogType = "feeding" | "sleep_start" | "wake" | "diaper" | "note";

export type TimelineRange = "3h" | "6h" | "8h";

export interface CareLogEntry {
  id: string;
  device_id: string;
  type: CareLogType;
  timestamp: string;
  amount_ml?: number | null;
  note?: string | null;
  created_at: string;
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

export interface TimelineResponse {
  device_id: string;
  range: TimelineRange;
  logs: CareLogEntry[];
  fetched_at: string;
}

export interface LatestHandoffResponse {
  handoff: Handoff | null;
}
