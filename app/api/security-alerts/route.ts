import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);

    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const alertType = searchParams.get("alertType");
    const limit = Number(searchParams.get("limit") || "100");

    const query: Record<string, unknown> = {};

    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (alertType) query.alertType = alertType;

    const data = await db
      .collection("security_alerts")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch security alerts" },
      { status: 500 }
    );
  }
}