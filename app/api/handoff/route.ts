import { NextRequest, NextResponse } from "next/server";
import { DEMO_DEVICE_ID } from "../../../lib/bubloo/constants";
import { generateAndPersistHandoff } from "../../../lib/bubloo/handoff";
import type { CareLogEntry } from "../../../lib/bubloo/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      device_id?: string;
      logs?: CareLogEntry[];
    };
    const deviceId = body.device_id ?? DEMO_DEVICE_ID;
    const handoff = await generateAndPersistHandoff(deviceId, body.logs);

    return NextResponse.json(handoff, { status: 200 });
  } catch (error) {
    console.error("Unable to generate handoff.", error);

    return NextResponse.json(
      {
        error: "Bubloo could not build the handoff just now.",
      },
      { status: 500 },
    );
  }
}
