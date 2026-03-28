import type { CareLogEntry } from "@/lib/domain/types";

export const DEMO_DEVICE_ID = "demo-device";
export const DEMO_NOTE_TEXT = "A little fussy before falling asleep";

function createSeedTimestamp(now: Date, minutesAgo: number): string {
  return new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();
}

export function buildDemoSeedLogs(now: Date = new Date(), deviceId: string = DEMO_DEVICE_ID): CareLogEntry[] {
  return [
    {
      id: "seed-diaper-1",
      device_id: deviceId,
      type: "diaper",
      timestamp: createSeedTimestamp(now, 55),
      created_at: createSeedTimestamp(now, 55),
    },
    {
      id: "seed-feeding-1",
      device_id: deviceId,
      type: "feeding",
      timestamp: createSeedTimestamp(now, 40),
      amount_ml: 120,
      created_at: createSeedTimestamp(now, 40),
    },
    {
      id: "seed-note-1",
      device_id: deviceId,
      type: "note",
      timestamp: createSeedTimestamp(now, 30),
      note: DEMO_NOTE_TEXT,
      created_at: createSeedTimestamp(now, 30),
    },
    {
      id: "seed-sleep-start-1",
      device_id: deviceId,
      type: "sleep_start",
      timestamp: createSeedTimestamp(now, 25),
      created_at: createSeedTimestamp(now, 25),
    },
  ];
}

export function buildSparseSeedLogs(now: Date = new Date(), deviceId: string = DEMO_DEVICE_ID): CareLogEntry[] {
  return [
    {
      id: "seed-feeding-sparse-1",
      device_id: deviceId,
      type: "feeding",
      timestamp: createSeedTimestamp(now, 75),
      amount_ml: 90,
      created_at: createSeedTimestamp(now, 75),
    },
    {
      id: "seed-note-sparse-1",
      device_id: deviceId,
      type: "note",
      timestamp: createSeedTimestamp(now, 32),
      note: "Settled after some rocking.",
      created_at: createSeedTimestamp(now, 32),
    },
    {
      id: "seed-sleep-start-sparse-1",
      device_id: deviceId,
      type: "sleep_start",
      timestamp: createSeedTimestamp(now, 18),
      created_at: createSeedTimestamp(now, 18),
    },
  ];
}
