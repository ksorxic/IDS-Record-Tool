import type {
  BlacklistEntry,
  DetectionRule,
  DetectionRuleType,
  MonitoredRange,
  ProtocolScope
} from "@/lib/admin-types";

const recommendedRulePresets: Record<
  DetectionRuleType,
  {
    recommendedName: string;
    recommendedThreshold: string;
    recommendedWindowMinutes: string;
    recommendedDescription: string;
  }
> = {
  TRAFFIC_SPIKE: {
    recommendedName: "Network Throughput Spike",
    recommendedThreshold: "5000000",
    recommendedWindowMinutes: "1",
    recommendedDescription:
      "Recommended rule for catching abrupt increases in total network throughput."
  },
  REQUEST_FLOOD: {
    recommendedName: "Request Flood Per Source IP",
    recommendedThreshold: "100",
    recommendedWindowMinutes: "1",
    recommendedDescription:
      "Recommended rule for identifying unusual request bursts originating from the same source IP."
  },
  FAILED_CONNECTIONS: {
    recommendedName: "Repeated Failed TCP Connections",
    recommendedThreshold: "10",
    recommendedWindowMinutes: "1",
    recommendedDescription:
      "Recommended rule for detecting repeated failed TCP connection attempts from the same source IP."
  },
  SUSPICIOUS_PORTS: {
    recommendedName: "Sensitive Ports Access Attempts",
    recommendedThreshold: "5",
    recommendedWindowMinutes: "5",
    recommendedDescription:
      "Recommended rule for repeated access attempts to sensitive or commonly abused ports."
  },
  TOP_TALKERS: {
    recommendedName: "Heavy Talker Review Window",
    recommendedThreshold: "10",
    recommendedWindowMinutes: "5",
    recommendedDescription:
      "Recommended rule for highlighting the busiest IPs over a short rolling review window."
  }
};

export type MonitoredRangeForm = {
  id?: string;
  name: string;
  startIp: string;
  endIp: string;
  description: string;
  protocolScope: ProtocolScope;
  inspectionProfile: "BASELINE" | "BEHAVIORAL" | "DEEP_PACKET";
  enabled: boolean;
};

export type BlacklistForm = {
  id?: string;
  ip: string;
  reason: string;
  source: string;
  active: boolean;
};

export type RuleForm = {
  id?: string;
  name: string;
  type: DetectionRuleType;
  threshold: string;
  windowMinutes: string;
  description: string;
  enabled: boolean;
};

export const emptyMonitoredRangeForm: MonitoredRangeForm = {
  name: "",
  startIp: "",
  endIp: "",
  description: "",
  protocolScope: "ANY",
  inspectionProfile: "BEHAVIORAL",
  enabled: true
};

export const emptyBlacklistForm: BlacklistForm = {
  ip: "",
  reason: "",
  source: "manual",
  active: true
};

export const emptyRuleForm: RuleForm = {
  name: "",
  type: "TRAFFIC_SPIKE",
  threshold: "",
  windowMinutes: "",
  description: "",
  enabled: true
};

export function toMonitoredRangeForm(range: MonitoredRange): MonitoredRangeForm {
  return {
    id: range._id,
    name: range.name,
    startIp: range.startIp,
    endIp: range.endIp,
    description: range.description,
    protocolScope: range.protocolScope,
    inspectionProfile: range.inspectionProfile,
    enabled: range.enabled
  };
}

export function toBlacklistForm(entry: BlacklistEntry): BlacklistForm {
  return {
    id: entry._id,
    ip: entry.ip,
    reason: entry.reason,
    source: entry.source,
    active: entry.active
  };
}

export function toRuleForm(rule: DetectionRule): RuleForm {
  return {
    id: rule._id,
    name: rule.name,
    type: rule.type,
    threshold: rule.threshold ? String(rule.threshold) : "",
    windowMinutes: rule.windowMinutes ? String(rule.windowMinutes) : "",
    description: rule.description ?? "",
    enabled: rule.enabled
  };
}

export function applyRulePreset(
  current: RuleForm,
  type: DetectionRuleType
): RuleForm {
  const preset = recommendedRulePresets[type];

  return {
    ...current,
    name: preset.recommendedName,
    type,
    threshold: preset.recommendedThreshold,
    windowMinutes: preset.recommendedWindowMinutes,
    description: preset.recommendedDescription,
    enabled: true
  };
}
