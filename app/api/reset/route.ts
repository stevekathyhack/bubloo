import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");

export async function POST() {
  try {
    await fs.writeFile(path.join(DATA_DIR, "care-logs.json"), "[]", "utf8");
    await fs.writeFile(path.join(DATA_DIR, "handoffs.json"), "[]", "utf8");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reset failed", error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
