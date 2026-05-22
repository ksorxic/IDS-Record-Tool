import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import {
  normalizeMonitoredRangeInput,
  validateMonitoredRangeInput,
  type MonitoredRangeInput
} from "@/lib/ip-utils";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as MonitoredRangeInput;
    const validationError = validateMonitoredRangeInput(body);

    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    const db = await getDb();
    const updateDoc = {
      ...normalizeMonitoredRangeInput(body),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection("monitored_ranges").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Monitored range not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update monitored range" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const db = await getDb();

    const result = await db.collection("monitored_ranges").deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Monitored range not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete monitored range" },
      { status: 500 }
    );
  }
}
