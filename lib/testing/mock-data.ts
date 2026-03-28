import type { CareLogEntry, CareLogType } from "@/lib/domain/types";

export interface MockCareLogOptions {
  id?: string;
  device_id?: string;
  type?: CareLogType;
  now?: Date;
  timestamp?: string;
  created_at?: string;
  minutesAgo?: number;
  amount_ml?: number | null;
  note?: string | null;
}

export function createMockCareLog(options: MockCareLogOptions = {}): CareLogEntry {
  const now = options.now ?? new Date("2026-03-28T14:30:00.000Z");
  const timestamp =
    options.timestamp ??
    new Date(now.getTime() - (options.minutesAgo ?? 0) * 60 * 1000).toISOString();

  return {
    id: options.id ?? `mock-${options.type ?? "note"}-${options.minutesAgo ?? 0}`,
    device_id: options.device_id ?? "device-test",
    type: options.type ?? "note",
    timestamp,
    amount_ml: options.amount_ml,
    note: options.note,
    created_at: options.created_at ?? timestamp,
  };
}

export function createMockCareLogs(entries: MockCareLogOptions[], now: Date = new Date("2026-03-28T14:30:00.000Z")): CareLogEntry[] {
  return entries.map((entry, index) =>
    createMockCareLog({
      ...entry,
      id: entry.id ?? `mock-log-${index + 1}`,
      now: entry.now ?? now,
    }),
  );
}
