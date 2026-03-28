import type { CareLogEntry } from "@/lib/domain/types";

export const DEMO_DEVICE_ID = "demo-device";
export const DEMO_NOTE_TEXT = "A little fussy before falling asleep";

function hoursAgo(now: Date, hours: number): string {
  return new Date(now.getTime() - hours * 60 * 60_000).toISOString();
}

export function buildDemoSeedLogs(now: Date = new Date(), deviceId: string = DEMO_DEVICE_ID): CareLogEntry[] {
  const logs: CareLogEntry[] = [
    // ── Yesterday — normal day (avg ~150 mL, ~5h total sleep) ──
    { id: "y-f1", device_id: deviceId, type: "feeding",     timestamp: hoursAgo(now, 26),   amount_ml: 150, created_at: hoursAgo(now, 26) },
    { id: "y-d1", device_id: deviceId, type: "diaper",      timestamp: hoursAgo(now, 25.5), created_at: hoursAgo(now, 25.5) },
    { id: "y-s1", device_id: deviceId, type: "sleep_start", timestamp: hoursAgo(now, 24),   created_at: hoursAgo(now, 24) },
    { id: "y-w1", device_id: deviceId, type: "wake",        timestamp: hoursAgo(now, 21.5), created_at: hoursAgo(now, 21.5) },
    { id: "y-f2", device_id: deviceId, type: "feeding",     timestamp: hoursAgo(now, 21),   amount_ml: 155, created_at: hoursAgo(now, 21) },
    { id: "y-d2", device_id: deviceId, type: "diaper",      timestamp: hoursAgo(now, 18),   created_at: hoursAgo(now, 18) },
    { id: "y-s2", device_id: deviceId, type: "sleep_start", timestamp: hoursAgo(now, 17),   created_at: hoursAgo(now, 17) },
    { id: "y-w2", device_id: deviceId, type: "wake",        timestamp: hoursAgo(now, 14.5), created_at: hoursAgo(now, 14.5) },
    { id: "y-f3", device_id: deviceId, type: "feeding",     timestamp: hoursAgo(now, 14),   amount_ml: 145, created_at: hoursAgo(now, 14) },

    // ── Today — lower feeding (~95 mL avg), shorter sleep (~1.5h) ──
    { id: "t-f1", device_id: deviceId, type: "feeding",     timestamp: hoursAgo(now, 7),   amount_ml: 90,  created_at: hoursAgo(now, 7) },
    { id: "t-s1", device_id: deviceId, type: "sleep_start", timestamp: hoursAgo(now, 5),   created_at: hoursAgo(now, 5) },
    { id: "t-w1", device_id: deviceId, type: "wake",        timestamp: hoursAgo(now, 3.5), created_at: hoursAgo(now, 3.5) },
    { id: "t-d1", device_id: deviceId, type: "diaper",      timestamp: hoursAgo(now, 3),   created_at: hoursAgo(now, 3) },
    { id: "t-f2", device_id: deviceId, type: "feeding",     timestamp: hoursAgo(now, 2.5), amount_ml: 100, created_at: hoursAgo(now, 2.5) },
    { id: "t-n1", device_id: deviceId, type: "note",        timestamp: hoursAgo(now, 0.75), note: DEMO_NOTE_TEXT, created_at: hoursAgo(now, 0.75) },
    { id: "t-s2", device_id: deviceId, type: "sleep_start", timestamp: hoursAgo(now, 0.5), created_at: hoursAgo(now, 0.5) },
  ];

  return logs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function buildSparseSeedLogs(now: Date = new Date(), deviceId: string = DEMO_DEVICE_ID): CareLogEntry[] {
  return [
    { id: "sp-f1", device_id: deviceId, type: "feeding",     timestamp: hoursAgo(now, 1.5), amount_ml: 90,  created_at: hoursAgo(now, 1.5) },
    { id: "sp-n1", device_id: deviceId, type: "note",        timestamp: hoursAgo(now, 0.5), note: "Settled after some rocking.", created_at: hoursAgo(now, 0.5) },
    { id: "sp-s1", device_id: deviceId, type: "sleep_start", timestamp: hoursAgo(now, 0.25), created_at: hoursAgo(now, 0.25) },
  ];
}
