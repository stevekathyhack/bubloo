import { NextRequest, NextResponse } from "next/server";
import { DEMO_DEVICE_ID } from "../../../lib/bubloo/constants";
import {
  appendPersistedCareLog,
  getRecentCareLogs,
  syncPersistedCareLogsForDevice,
} from "../../../lib/bubloo/store";
import { parseTimelineRange } from "../../../lib/bubloo/time";
import type { CareLogEntry, TimelineResponse } from "../../../lib/bubloo/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("device_id") ?? DEMO_DEVICE_ID;
  const range = parseTimelineRange(searchParams.get("range"));
  const limit = Number.parseInt(searchParams.get("limit") ?? "20", 10);
  const offset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
  const safeLimit = Number.isNaN(limit) ? 20 : Math.min(Math.max(limit, 1), 50);
  const safeOffset = Number.isNaN(offset) ? 0 : Math.max(offset, 0);

  const logs = await getRecentCareLogs({
    deviceId,
    range,
    limit: safeLimit,
    offset: safeOffset,
  });

  const response: TimelineResponse = {
    device_id: deviceId,
    range,
    logs,
    fetched_at: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      device_id?: string;
      logs?: CareLogEntry[];
      log?: CareLogEntry;
    } & Partial<CareLogEntry>;

    const deviceId = body.device_id ?? DEMO_DEVICE_ID;

    if (Array.isArray(body.logs)) {
      const logs = await syncPersistedCareLogsForDevice({
        deviceId,
        logs: body.logs,
      });

      return NextResponse.json(
        {
          device_id: deviceId,
          count: logs.length,
        },
        { status: 200 },
      );
    }

    const logCandidate = body.log ?? body;
    if (
      typeof logCandidate.id === "string" &&
      typeof logCandidate.type === "string" &&
      typeof logCandidate.timestamp === "string" &&
      typeof logCandidate.created_at === "string"
    ) {
      const log: CareLogEntry = {
        id: logCandidate.id,
        device_id: deviceId,
        type: logCandidate.type,
        timestamp: logCandidate.timestamp,
        amount_ml: logCandidate.amount_ml ?? null,
        note: logCandidate.note ?? null,
        created_at: logCandidate.created_at,
      };

      await appendPersistedCareLog(log);
      return NextResponse.json(log, { status: 201 });
    }

    return NextResponse.json(
      {
        error: "A full log entry or logs array is required.",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Unable to save logs.", error);

    return NextResponse.json(
      {
        error: "Bubloo could not save logs just now.",
      },
      { status: 500 },
    );
  }
}
