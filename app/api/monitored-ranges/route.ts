import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  normalizeMonitoredRangeInput,
  validateMonitoredRangeInput,
  type MonitoredRangeInput
} from "@/lib/ip-utils";

export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .collection("monitored_ranges")
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch monitored ranges" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MonitoredRangeInput;
    const validationError = validateMonitoredRangeInput(body);

    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const normalized = normalizeMonitoredRangeInput(body);
    const doc = {
      ...normalized,
      createdAt: now,
      updatedAt: now
    };

    const db = await getDb();
    const result = await db.collection("monitored_ranges").insertOne(doc);

    return NextResponse.json({
      success: true,
      insertedId: result.insertedId
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create monitored range" },
      { status: 500 }
    );
  }
}
