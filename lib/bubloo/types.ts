// Shared types re-exported from canonical source
export type {
  CareLogType,
  CareLogEntry,
  HandoffDraft,
  Handoff,
} from "@/lib/domain/types";

import type { CareLogEntry, Handoff } from "@/lib/domain/types";

export type TimelineRange = "12h" | "24h" | "48h";

export interface TimelineResponse {
  device_id: string;
  range: TimelineRange;
  logs: CareLogEntry[];
  fetched_at: string;
}

export interface LatestHandoffResponse {
  handoff: Handoff | null;
}
