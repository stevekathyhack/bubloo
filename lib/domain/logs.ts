import type { CareLogEntry, CreateCareLogInput } from "@/lib/domain/types";

export function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function isValidTimestamp(value: Date | string): boolean {
  return !Number.isNaN(toDate(value).getTime());
}

export function sortLogsByTimestamp(logs: CareLogEntry[], direction: "asc" | "desc" = "desc"): CareLogEntry[] {
  const sorted = [...logs].sort((left, right) => {
    return toDate(left.timestamp).getTime() - toDate(right.timestamp).getTime();
  });

  return direction === "asc" ? sorted : sorted.reverse();
}

export function filterLogsWithinHours(logs: CareLogEntry[], hours: number, now: Date = new Date()): CareLogEntry[] {
  const windowStart = now.getTime() - hours * 60 * 60 * 1000;

  return logs.filter((log) => {
    const timestamp = toDate(log.timestamp).getTime();
    if (Number.isNaN(timestamp)) {
      return false;
    }

    return timestamp >= windowStart && timestamp <= now.getTime();
  });
}

export function getTrimmedNote(log: Pick<CareLogEntry, "note">): string | null {
  const note = log.note?.trim();
  return note ? note : null;
}

export function createLocalId(prefix = "bubloo"): string {
  const rawId =
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return prefix ? `${prefix}-${rawId}` : rawId;
}

export function createCareLogEntry({
  deviceId,
  input,
  now = new Date(),
}: {
  deviceId: string;
  input: CreateCareLogInput;
  now?: Date;
}): CareLogEntry {
  const timestamp = input.timestamp ?? now.toISOString();
  const amountMl =
    typeof input.amount_ml === "number" &&
    Number.isFinite(input.amount_ml) &&
    input.amount_ml > 0
      ? Math.round(input.amount_ml)
      : null;
  const note = getTrimmedNote({ note: input.note });

  return {
    id: createLocalId("log"),
    device_id: deviceId,
    type: input.type,
    timestamp: isValidTimestamp(timestamp) ? toDate(timestamp).toISOString() : now.toISOString(),
    amount_ml: amountMl,
    note,
    created_at: now.toISOString(),
  };
}
