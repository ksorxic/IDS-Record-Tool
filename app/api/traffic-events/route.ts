import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);

    const srcIp = searchParams.get("srcIp");
    const dstIp = searchParams.get("dstIp");
    const dstPort = searchParams.get("dstPort");
    const protocol = searchParams.get("protocol");
    const limit = Number(searchParams.get("limit") || "100");

    const query: Record<string, unknown> = {};

    if (srcIp) query.srcIp = srcIp;
    if (dstIp) query.dstIp = dstIp;
    if (dstPort) query.dstPort = Number(dstPort);
    if (protocol) query.protocol = protocol;

    const data = await db
      .collection("traffic_events")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch traffic events" },
      { status: 500 }
    );
  }
}