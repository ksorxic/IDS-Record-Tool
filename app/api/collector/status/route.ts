import { NextResponse } from "next/server";
import type {
  CollectorRuntimeStatus,
  CollectorStatusResponse
} from "@/lib/admin-types";
import { getManagedCollectorStatus } from "@/lib/collector-service";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

const HEARTBEAT_FRESHNESS_MS = 15_000;

function serializeRuntimeDoc(
  value: Record<string, unknown> | null
): CollectorRuntimeStatus | null {
  if (!value) {
    return null;
  }

  return JSON.parse(
    JSON.stringify(value, (_, nested) => {
      if (nested instanceof Date) {
        return nested.toISOString();
      }
      if (nested && typeof nested === "object" && "_bsontype" in nested) {
        return String(nested);
      }
      return nested;
    })
  ) as CollectorRuntimeStatus;
}

export async function GET() {
  const managed = getManagedCollectorStatus();
  let runtime: CollectorRuntimeStatus | null = null;

  try {
    const db = await getDb();
    const runtimeDoc = await db
      .collection<CollectorRuntimeStatus & { _id: string }>("collector_runtime")
      .findOne({
        _id: "primary"
      });
    runtime = serializeRuntimeDoc(runtimeDoc as Record<string, unknown> | null);
  } catch {
    runtime = null;
  }

  const heartbeatFresh = runtime?.lastHeartbeatAt
    ? Date.now() - new Date(runtime.lastHeartbeatAt).getTime() <=
      HEARTBEAT_FRESHNESS_MS
    : false;

  const heartbeatRunning =
    heartbeatFresh && (runtime?.status === "running" || runtime?.status === "starting");

  const managedIsAuthoritative =
    managed.state !== "idle" &&
    (managed.running ||
      managed.state === "stopping" ||
      managed.state === "stopped" ||
      managed.state === "error" ||
      managed.overrideActive);

  const running = managedIsAuthoritative ? managed.running : heartbeatRunning;
  const origin: CollectorStatusResponse["origin"] = managedIsAuthoritative
    ? "managed"
    : heartbeatRunning
      ? "heartbeat"
      : "unknown";

  const response: CollectorStatusResponse = {
    running,
    origin,
    managedProcess: managed,
    runtime,
    latestMaliciousAlert: runtime?.latestMaliciousAlert ?? null
  };

  return NextResponse.json({ success: true, data: response });
}
