import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

function isValidIp(ip: string) {
  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
  return ipv4.test(ip);
}

export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .collection("blacklist_ips")
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch blacklist IPs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.ip || !isValidIp(body.ip)) {
      return NextResponse.json(
        { success: false, error: "Invalid IP address" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const doc = {
      ip: body.ip,
      reason: body.reason || "",
      source: body.source || "manual",
      active: body.active ?? true,
      createdAt: now,
      updatedAt: now
    };

    const db = await getDb();

    await db.collection("blacklist_ips").updateOne(
      { ip: body.ip },
      { $set: doc },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to add blacklist IP" },
      { status: 500 }
    );
  }
}