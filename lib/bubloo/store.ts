import { promises as fs } from "fs";
import path from "path";
import { DEMO_DEVICE_ID } from "./constants";
import { rangeToHours } from "./time";
import type { CareLogEntry, Handoff, TimelineRange } from "./types";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const CARE_LOGS_PATH = path.join(DATA_DIRECTORY, "care-logs.json");
const HANDOFFS_PATH = path.join(DATA_DIRECTORY, "handoffs.json");
const CARE_LOG_TYPES = new Set(["feeding", "sleep_start", "wake", "diaper", "note"]);

function minutesAgo(now: Date, minutes: number): string {
  return new Date(now.getTime() - minutes * 60_000).toISOString();
}

export function getSeedLogs(now = new Date(), deviceId = DEMO_DEVICE_ID): CareLogEntry[] {
  const entries: CareLogEntry[] = [
    {
      id: "log-sleep-start",
      device_id: deviceId,
      type: "sleep_start",
      timestamp: minutesAgo(now, 25),
      created_at: minutesAgo(now, 25),
    },
    {
      id: "log-note-recent",
      device_id: deviceId,
      type: "note",
      timestamp: minutesAgo(now, 30),
      note: "A little fussy before falling asleep",
      created_at: minutesAgo(now, 30),
    },
    {
      id: "log-feeding-recent",
      device_id: deviceId,
      type: "feeding",
      timestamp: minutesAgo(now, 40),
      amount_ml: 120,
      created_at: minutesAgo(now, 40),
    },
    {
      id: "log-diaper-recent",
      device_id: deviceId,
      type: "diaper",
      timestamp: minutesAgo(now, 55),
      created_at: minutesAgo(now, 55),
    },
    {
      id: "log-wake-earlier",
      device_id: deviceId,
      type: "wake",
      timestamp: minutesAgo(now, 260),
      created_at: minutesAgo(now, 260),
    },
    {
      id: "log-feeding-earlier",
      device_id: deviceId,
      type: "feeding",
      timestamp: minutesAgo(now, 315),
      amount_ml: 90,
      created_at: minutesAgo(now, 315),
    },
    {
      id: "log-note-earlier",
      device_id: deviceId,
      type: "note",
      timestamp: minutesAgo(now, 415),
      note: "Settled after a short cuddle",
      created_at: minutesAgo(now, 415),
    },
  ];

  return entries.sort(
    (left, right) =>
      new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
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
}

export async function appendPersistedCareLog(log: CareLogEntry): Promise<void> {
  await ensureDataDirectory();
  const existing = await readPersistedCareLogs();
  const next = sortLogsNewestFirst([log, ...existing.filter((entry) => entry.id !== log.id)]);
  await fs.writeFile(CARE_LOGS_PATH, JSON.stringify(next, null, 2), "utf8");
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
  await ensureDataDirectory();
  const existing = await readPersistedHandoffs();
  const next = [handoff, ...existing].sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  );

  await fs.writeFile(HANDOFFS_PATH, JSON.stringify(next, null, 2), "utf8");
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
