import "server-only";

import type { Document, WithId } from "mongodb";
import { ObjectId } from "mongodb";
import {
  type BlacklistEntry,
  type ChartPoint,
  type DashboardData,
  type DetectionRule,
  type MonitoredRange,
  type SecurityAlert,
  type SummaryCard,
  type TopTalkerSnapshot,
  type TrafficEvent
} from "@/lib/admin-types";
import { getDb } from "@/lib/mongodb";
import { buildLiveTrafficMetrics } from "@/lib/live-traffic";
import { extractTopTalkersFromSnapshots } from "@/lib/top-talkers";

function serializeValue(value: unknown): unknown {
  if (value instanceof ObjectId) {
    return value.toHexString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        serializeValue(nestedValue)
      ])
    );
  }

  return value;
}

function serializeDoc<T>(doc: WithId<Document>): T {
  return serializeValue(doc) as T;
}

function emptySummaryCards(): SummaryCard[] {
  return [
    {
      label: "Monitored Ranges",
      value: "0",
      helper: "No scoped network segments configured yet"
    },
    {
      label: "Critical Alerts",
      value: "0",
      helper: "Latest alert severity is currently stable"
    },
    {
      label: "Blacklisted IPs",
      value: "0",
      helper: "No manually blocked IPv4 sources"
    },
    {
      label: "24h Traffic Events",
      value: "0",
      helper: "No suspicious packet telemetry ingested"
    }
  ];
}

function buildSeverityChart(alerts: SecurityAlert[]): ChartPoint[] {
  const severityOrder = ["critical", "high", "medium", "low"] as const;
  const counts = new Map<string, number>();

  for (const severity of severityOrder) {
    counts.set(severity, 0);
  }

  for (const alert of alerts) {
    const key = alert.severity?.toLowerCase() ?? "low";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return severityOrder.map((severity) => ({
    label: severity.toUpperCase(),
    value: counts.get(severity) ?? 0
  }));
}

function buildProtocolChart(events: TrafficEvent[]): ChartPoint[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    const key = (event.protocol ?? "UNKNOWN").toUpperCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function buildHourlyTraffic(events: TrafficEvent[]): ChartPoint[] {
  const now = Date.now();
  const hourlyBuckets = new Map<string, number>();

  for (let hourOffset = 11; hourOffset >= 0; hourOffset -= 1) {
    const bucketDate = new Date(now - hourOffset * 60 * 60 * 1000);
    const label = bucketDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
    hourlyBuckets.set(label, 0);
  }

  for (const event of events) {
    if (!event.timestamp) {
      continue;
    }

    const eventDate = new Date(event.timestamp);
    if (Number.isNaN(eventDate.getTime())) {
      continue;
    }

    const ageInHours = (now - eventDate.getTime()) / (60 * 60 * 1000);
    if (ageInHours < 0 || ageInHours > 12) {
      continue;
    }

    const label = eventDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });

    if (hourlyBuckets.has(label)) {
      hourlyBuckets.set(label, (hourlyBuckets.get(label) ?? 0) + 1);
    }
  }

  return Array.from(hourlyBuckets.entries()).map(([label, value]) => ({
    label,
    value
  }));
}

function buildSummaryCards(
  monitoredRanges: MonitoredRange[],
  blacklist: BlacklistEntry[],
  alerts: SecurityAlert[],
  trafficEvents: TrafficEvent[]
): SummaryCard[] {
  const criticalAlerts = alerts.filter(
    (alert) => (alert.severity ?? "").toLowerCase() === "critical"
  ).length;
  const activeRanges = monitoredRanges.filter((item) => item.enabled).length;
  const activeBlacklist = blacklist.filter((item) => item.active).length;
  const recentTrafficEvents = trafficEvents.filter((event) => {
    if (!event.timestamp) {
      return false;
    }

    const timestamp = new Date(event.timestamp).getTime();
    return !Number.isNaN(timestamp) && Date.now() - timestamp <= 24 * 60 * 60 * 1000;
  }).length;

  return [
    {
      label: "Monitored Ranges",
      value: String(activeRanges),
      helper: `${monitoredRanges.length} total IP windows across the perimeter`
    },
    {
      label: "Critical Alerts",
      value: String(criticalAlerts),
      helper: "Immediate packet anomalies requiring analyst review"
    },
    {
      label: "Blacklisted IPs",
      value: String(activeBlacklist),
      helper: `${blacklist.length} stored ban records from all sources`
    },
    {
      label: "24h Traffic Events",
      value: String(recentTrafficEvents),
      helper: "Recent flows ingested for suspicious packet inspection"
    }
  ];
}

export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const db = await getDb();
    const [
      monitoredRangeDocs,
      blacklistDocs,
      ruleDocs,
      alertDocs,
      trafficEventDocs,
      topTalkerDocs
    ] = await Promise.all([
      db.collection("monitored_ranges").find({}).sort({ updatedAt: -1 }).limit(8).toArray(),
      db.collection("blacklist_ips").find({}).sort({ updatedAt: -1 }).limit(8).toArray(),
      db.collection("rules").find({}).sort({ updatedAt: -1 }).limit(8).toArray(),
      db.collection("security_alerts").find({}).sort({ timestamp: -1 }).limit(12).toArray(),
      db.collection("traffic_events").find({}).sort({ timestamp: -1 }).limit(320).toArray(),
      db.collection("top_talker_snapshots").find({}).sort({ timestamp: -1 }).limit(8).toArray()
    ]);

    const monitoredRanges = monitoredRangeDocs.map((doc) =>
      serializeDoc<MonitoredRange>(doc)
    );
    const blacklist = blacklistDocs.map((doc) =>
      serializeDoc<BlacklistEntry>(doc)
    );
    const rules = ruleDocs.map((doc) => serializeDoc<DetectionRule>(doc));
    const alerts = alertDocs.map((doc) => serializeDoc<SecurityAlert>(doc));
    const trafficEvents = trafficEventDocs.map((doc) =>
      serializeDoc<TrafficEvent>(doc)
    );
    const topTalkerSnapshots = topTalkerDocs.map((doc) =>
      serializeDoc<TopTalkerSnapshot>(doc)
    );
    const topTalkers = extractTopTalkersFromSnapshots(topTalkerSnapshots);
    const liveTraffic = buildLiveTrafficMetrics(trafficEvents, {
      locale: "el-GR"
    });

    return {
      connectionStatus: "healthy",
      summaryCards: buildSummaryCards(
        monitoredRanges,
        blacklist,
        alerts,
        trafficEvents
      ),
      alertsBySeverity: buildSeverityChart(alerts),
      trafficByProtocol: buildProtocolChart(trafficEvents),
      hourlyTraffic: buildHourlyTraffic(trafficEvents),
      liveTraffic,
      monitoredRanges,
      blacklist,
      rules,
      alerts,
      trafficEvents: trafficEvents.slice(0, 8),
      topTalkers
    };
  } catch {
    return {
      connectionStatus: "degraded",
      summaryCards: emptySummaryCards(),
      alertsBySeverity: [],
      trafficByProtocol: [],
      hourlyTraffic: [],
      liveTraffic: buildLiveTrafficMetrics([]),
      monitoredRanges: [],
      blacklist: [],
      rules: [],
      alerts: [],
      trafficEvents: [],
      topTalkers: []
    };
  }
}
