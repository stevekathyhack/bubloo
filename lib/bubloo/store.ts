import { promises as fs } from "fs";
import path from "path";
import { buildDemoSeedLogs } from "@/lib/domain/seed";
import { DEMO_DEVICE_ID } from "./constants";
import { rangeToHours } from "./time";
import type { CareLogEntry, Handoff, TimelineRange } from "./types";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const CARE_LOGS_PATH = path.join(DATA_DIRECTORY, "care-logs.json");
const HANDOFFS_PATH = path.join(DATA_DIRECTORY, "handoffs.json");
const CARE_LOG_TYPES = new Set(["feeding", "sleep_start", "wake", "diaper", "note"]);

// Simple promise-based mutex to prevent concurrent file read-write races
const fileLocks = new Map<string, Promise<void>>();

async function withFileLock<T>(filePath: string, fn: () => Promise<T>): Promise<T> {
  const previous = fileLocks.get(filePath) ?? Promise.resolve();
  let release: () => void;
  const next = new Promise<void>((resolve) => {
    release = resolve;
  });
  fileLocks.set(filePath, next);

  await previous;
  try {
    return await fn();
  } finally {
    release!();
  }
}

export function getSeedLogs(now = new Date(), deviceId = DEMO_DEVICE_ID): CareLogEntry[] {
  return buildDemoSeedLogs(now, deviceId);
}

function isPersistedCareLogEntry(candidate: unknown): candidate is CareLogEntry {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof (candidate as CareLogEntry).id === "string" &&
    typeof (candidate as CareLogEntry).device_id === "string" &&
    typeof (candidate as CareLogEntry).type === "string" &&
    CARE_LOG_TYPES.has((candidate as CareLogEntry).type) &&
    typeof (candidate as CareLogEntry).timestamp === "string" &&
    !Number.isNaN(new Date((candidate as CareLogEntry).timestamp).getTime()) &&
    typeof (candidate as CareLogEntry).created_at === "string" &&
    !Number.isNaN(new Date((candidate as CareLogEntry).created_at).getTime())
  );
}

function sortLogsNewestFirst(logs: CareLogEntry[]): CareLogEntry[] {
  return [...logs].sort(
    (left, right) =>
      new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
}

export async function getRecentCareLogs({
  deviceId = DEMO_DEVICE_ID,
  range = "8h",
  limit = 20,
  offset = 0,
  now = new Date(),
}: {
  deviceId?: string;
  range?: TimelineRange;
  limit?: number;
  offset?: number;
  now?: Date;
} = {}): Promise<CareLogEntry[]> {
  const rangeHours = rangeToHours(range);
  const oldestAllowed = now.getTime() - rangeHours * 60 * 60_000;
  const persistedLogs = await getPersistedCareLogsForDevice(deviceId);
  const sourceLogs = persistedLogs.length > 0 ? persistedLogs : getSeedLogs(now, deviceId);
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safeOffset = Math.max(offset, 0);

  return sourceLogs
    .filter((log) => new Date(log.timestamp).getTime() >= oldestAllowed)
    .slice(safeOffset, safeOffset + safeLimit);
}

async function ensureDataDirectory(): Promise<void> {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
}

export async function readPersistedCareLogs(): Promise<CareLogEntry[]> {
  try {
    const content = await fs.readFile(CARE_LOGS_PATH, "utf8");
    const parsed = JSON.parse(content) as unknown[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return sortLogsNewestFirst(parsed.filter(isPersistedCareLogEntry));
  } catch (error) {
    const hasNoFile =
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT";

    if (hasNoFile) {
      return [];
    }

    throw error;
  }
}

export async function getPersistedCareLogsForDevice(
  deviceId = DEMO_DEVICE_ID,
): Promise<CareLogEntry[]> {
  const logs = await readPersistedCareLogs();
  return logs.filter((log) => log.device_id === deviceId);
}

export async function syncPersistedCareLogsForDevice({
  deviceId = DEMO_DEVICE_ID,
  logs,
}: {
  deviceId?: string;
  logs: CareLogEntry[];
}): Promise<CareLogEntry[]> {
  return withFileLock(CARE_LOGS_PATH, async () => {
    await ensureDataDirectory();
    const existing = await readPersistedCareLogs();
    const retainedLogs = existing.filter((log) => log.device_id !== deviceId);
    const normalizedLogs = sortLogsNewestFirst(
      logs
        .filter(isPersistedCareLogEntry)
        .map((log) => ({
          ...log,
          device_id: deviceId,
        })),
    );

    await fs.writeFile(
      CARE_LOGS_PATH,
      JSON.stringify([...retainedLogs, ...normalizedLogs], null, 2),
      "utf8",
    );

    return normalizedLogs;
  });
}

export async function appendPersistedCareLog(log: CareLogEntry): Promise<void> {
  return withFileLock(CARE_LOGS_PATH, async () => {
    await ensureDataDirectory();
    const existing = await readPersistedCareLogs();
    const next = sortLogsNewestFirst([log, ...existing.filter((entry) => entry.id !== log.id)]);
    await fs.writeFile(CARE_LOGS_PATH, JSON.stringify(next, null, 2), "utf8");
  });
}

export async function readPersistedHandoffs(): Promise<Handoff[]> {
  try {
    const content = await fs.readFile(HANDOFFS_PATH, "utf8");
    const parsed = JSON.parse(content) as Handoff[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    const hasNoFile =
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT";

    if (hasNoFile) {
      return [];
    }

    throw error;
  }
}

export async function saveHandoffRecord(handoff: Handoff): Promise<void> {
  return withFileLock(HANDOFFS_PATH, async () => {
    await ensureDataDirectory();
    const existing = await readPersistedHandoffs();
    const next = [handoff, ...existing].sort(
      (left, right) =>
        new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    );

    await fs.writeFile(HANDOFFS_PATH, JSON.stringify(next, null, 2), "utf8");
  });
}

export async function getLatestPersistedHandoff(
  deviceId = DEMO_DEVICE_ID,
): Promise<Handoff | null> {
  const handoffs = await readPersistedHandoffs();
  return handoffs.find((handoff) => handoff.device_id === deviceId) ?? null;
}

export async function clearPersistedHandoffs(): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(HANDOFFS_PATH, "[]\n", "utf8");
}
