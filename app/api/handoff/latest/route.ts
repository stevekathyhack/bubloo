import { NextRequest, NextResponse } from "next/server";
import { DEMO_DEVICE_ID } from "../../../../lib/bubloo/constants";
import { getLatestPersistedHandoff } from "../../../../lib/bubloo/store";
import type { LatestHandoffResponse } from "../../../../lib/bubloo/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("device_id") ?? DEMO_DEVICE_ID;
    const handoff = await getLatestPersistedHandoff(deviceId);

    const response: LatestHandoffResponse = {
      handoff,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unable to read latest handoff.", error);

    return NextResponse.json(
      {
        handoff: null,
      } satisfies LatestHandoffResponse,
      { status: 200 },
    );
  }
}
