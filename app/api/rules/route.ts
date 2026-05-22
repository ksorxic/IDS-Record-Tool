import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

type RuleRequestBody = {
  name?: string;
  type?: string;
  enabled?: boolean;
  threshold?: number;
  windowMinutes?: number;
  description?: string;
};

function validateRule(body: RuleRequestBody) {
  if (!body.name || !body.type) {
    return "Missing name or type";
  }

  const allowedTypes = [
    "REQUEST_FLOOD",
    "FAILED_CONNECTIONS",
    "TRAFFIC_SPIKE",
    "SUSPICIOUS_PORTS",
    "TOP_TALKERS"
  ];

  if (!allowedTypes.includes(body.type)) {
    return "Invalid rule type";
  }

  return null;
}

export async function GET() {
  try {
    const db = await getDb();
    const rules = await db
      .collection("rules")
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: rules });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch rules" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RuleRequestBody;
    const validationError = validateRule(body);

    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const doc = {
      ...body,
      enabled: body.enabled ?? true,
      createdAt: now,
      updatedAt: now
    };

    const db = await getDb();
    const result = await db.collection("rules").insertOne(doc);

    return NextResponse.json({
      success: true,
      insertedId: result.insertedId
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create rule" },
      { status: 500 }
    );
  }
}
