import type {
  CollectorStatusResponse,
  DashboardData,
  SecurityAlert
} from "@/lib/admin-types";

export type BrowserNotificationPermissionState =
  | NotificationPermission
  | "unsupported";

export type CollectorActionState = "idle" | "starting" | "stopping" | "restarting";

export type NetworkOverview = {
  totalBytes: number;
  uniqueSources: number;
  uniqueDestinations: number;
  busiestTalker: string;
};

export function formatTimestamp(value?: string): string {
  if (!value) {
    return "No timestamp";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsed);
}

export function isCollectorActuallyRunning(
  status: CollectorStatusResponse | null
): boolean {
  return Boolean(status?.running);
}

export function formatTransferRate(bytesPerSecond: number): string {
  const bitsPerSecond = bytesPerSecond * 8;
  const units = ["bps", "Kbps", "Mbps", "Gbps"];
  let value = bitsPerSecond;
  let unitIndex = 0;

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex += 1;
  }

  return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

export function formatByteSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

export function buildHealthyStateLabel(
  connectionStatus: DashboardData["connectionStatus"]
): string {
  return connectionStatus === "healthy"
    ? "Flow of data and the dashboard are synchronized normally."
    : "No data available from the database at the time of rendering.";
}

export function countActiveAlerts(alerts: SecurityAlert[]): number {
  return alerts.filter(
    (alert) => (alert.status ?? "open").toLowerCase() !== "resolved"
  ).length;
}

export function buildNetworkOverview(dashboard: DashboardData): NetworkOverview {
  const totalBytes = dashboard.trafficEvents.reduce(
    (sum, event) => sum + (event.bytes ?? 0),
    0
  );
  const uniqueSources = new Set(
    dashboard.trafficEvents.map((event) => event.srcIp).filter(Boolean)
  ).size;
  const uniqueDestinations = new Set(
    dashboard.trafficEvents.map((event) => event.dstIp).filter(Boolean)
  ).size;
  const busiestTalker = dashboard.topTalkers[0]?.ip ?? "unknown host";

  return {
    totalBytes,
    uniqueSources,
    uniqueDestinations,
    busiestTalker
  };
}
