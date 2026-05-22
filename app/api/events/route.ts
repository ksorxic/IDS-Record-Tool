import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Collector event received:", body.type);

    // Εδώ:
    // 1. save MongoDB
    // 2. αν body.type === "SECURITY_ALERT" -> alerts collection
    // 3. αν body.type === "TRAFFIC_FLOW" -> traffic_events collection
    // 4. αν body.type === "TOP_TALKER_SNAPSHOT" -> stats_snapshots collection

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid body" },
      { status: 400 }
    );
  }
}
