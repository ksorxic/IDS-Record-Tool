import { NextRequest, NextResponse } from "next/server";
import {
  getManagedCollectorStatus,
  startManagedCollector,
  stopManagedCollector
} from "@/lib/collector-service";

export const runtime = "nodejs";

type ControlRequest = {
  action?: "start" | "stop" | "restart";
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ControlRequest;

    if (body.action === "start") {
      return NextResponse.json({
        success: true,
        data: startManagedCollector()
      });
    }

    if (body.action === "stop") {
      return NextResponse.json({
        success: true,
        data: await stopManagedCollector()
      });
    }

    if (body.action === "restart") {
      await stopManagedCollector();
      return NextResponse.json({
        success: true,
        data: startManagedCollector()
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid collector action" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to control collector",
        data: getManagedCollectorStatus()
      },
      { status: 500 }
    );
  }
}
