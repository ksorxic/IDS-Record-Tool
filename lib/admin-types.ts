export type SeverityLevel = "low" | "medium" | "high" | "critical";

export type DetectionRuleType =
  | "REQUEST_FLOOD"
  | "FAILED_CONNECTIONS"
  | "TRAFFIC_SPIKE"
  | "SUSPICIOUS_PORTS"
  | "TOP_TALKERS";

export type ProtocolScope = "ANY" | "TCP" | "UDP" | "ICMP";

export type InspectionProfile = "BASELINE" | "BEHAVIORAL" | "DEEP_PACKET";

export type MonitoredRange = {
  _id: string;
  name: string;
  startIp: string;
  endIp: string;
  description: string;
  enabled: boolean;
  protocolScope: ProtocolScope;
  inspectionProfile: InspectionProfile;
  createdAt: string;
  updatedAt: string;
};

export type BlacklistEntry = {
  _id: string;
  ip: string;
  reason: string;
  source: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DetectionRule = {
  _id: string;
  name: string;
  type: DetectionRuleType;
  threshold?: number;
  windowMinutes?: number;
  description?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SecurityAlert = {
  _id: string;
  srcIp?: string;
  dstIp?: string;
  alertType?: string;
  severity?: SeverityLevel;
  status?: string;
  timestamp?: string;
  message?: string;
};

export type TrafficEvent = {
  _id: string;
  srcIp?: string;
  srcPort?: number;
  dstIp?: string;
  dstPort?: number;
  protocol?: string;
  bytes?: number;
  packetCount?: number;
  timestamp?: string;
  tcpFlags?: {
    syn?: boolean;
    ack?: boolean;
    rst?: boolean;
  };
};

export type TopTalkerSnapshot = {
  _id: string;
  ip?: string;
  bytes?: number;
  packets?: number;
  protocol?: string;
  timestamp?: string;
  title?: string;
  metadata?: {
    intervalSec?: number;
    limit?: number;
    items?: Array<{
      ip?: string;
      totalBytes?: number;
    }>;
  };
};

export type SummaryCard = {
  label: string;
  value: string;
  helper: string;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type LiveTrafficSample = {
  label: string;
  totalBytes: number;
  bytesPerSecond: number;
  bitsPerSecond: number;
};

export type LiveTrafficMetrics = {
  windowSeconds: number;
  bucketSeconds: number;
  totalBytesInWindow: number;
  currentBytesPerSecond: number;
  peakBytesPerSecond: number;
  averageBytesPerSecond: number;
  samples: LiveTrafficSample[];
};

export type DashboardData = {
  connectionStatus: "healthy" | "degraded";
  summaryCards: SummaryCard[];
  alertsBySeverity: ChartPoint[];
  trafficByProtocol: ChartPoint[];
  hourlyTraffic: ChartPoint[];
  liveTraffic: LiveTrafficMetrics;
  monitoredRanges: MonitoredRange[];
  blacklist: BlacklistEntry[];
  rules: DetectionRule[];
  alerts: SecurityAlert[];
  trafficEvents: TrafficEvent[];
  topTalkers: TopTalkerSnapshot[];
};

export type CollectorAlertSummary = {
  alertType?: string;
  severity?: string;
  srcIp?: string;
  dstIp?: string;
  timestamp?: string;
  title?: string;
  description?: string;
  status?: string;
};

export type CollectorRuntimeStatus = {
  _id?: string;
  status?: "starting" | "running" | "stopped" | "error";
  pid?: number;
  startedAt?: string;
  stoppedAt?: string;
  lastHeartbeatAt?: string;
  lastPacketAt?: string;
  lastAlertAt?: string;
  lastErrorAt?: string;
  lastErrorMessage?: string;
  processedEvents?: number;
  totalAlerts?: number;
  monitoredRangeCount?: number;
  requestRule?: {
    enabled?: boolean;
    windowSec?: number;
    threshold?: number;
  };
  failedConnectionRule?: {
    enabled?: boolean;
    windowSec?: number;
    threshold?: number;
  };
  trafficSpikeRule?: {
    enabled?: boolean;
    windowSec?: number;
    bytesThreshold?: number;
  };
  latestMaliciousAlert?: CollectorAlertSummary | null;
};

export type CollectorStatusResponse = {
  running: boolean;
  origin: "managed" | "heartbeat" | "unknown";
  managedProcess: {
    state: "idle" | "starting" | "running" | "stopping" | "stopped" | "error";
    running: boolean;
    pid: number | null;
    startedAt: string | null;
    lastExitAt: string | null;
    lastError: string | null;
    lastLogLine: string | null;
    overrideActive?: boolean;
  };
  runtime: CollectorRuntimeStatus | null;
  latestMaliciousAlert: CollectorAlertSummary | null;
};
