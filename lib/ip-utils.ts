import type { InspectionProfile, ProtocolScope } from "@/lib/admin-types";

export type MonitoredRangeInput = {
  name: string;
  startIp: string;
  endIp: string;
  description?: string;
  enabled?: boolean;
  protocolScope?: ProtocolScope;
  inspectionProfile?: InspectionProfile;
};

export type ComparableRange = {
  startIp: string;
  endIp: string;
};

const IPV4_SEGMENT = "(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)";
const IPV4_REGEX = new RegExp(
  `^${IPV4_SEGMENT}\\.${IPV4_SEGMENT}\\.${IPV4_SEGMENT}\\.${IPV4_SEGMENT}$`
);

const ALLOWED_PROTOCOLS: ProtocolScope[] = ["ANY", "TCP", "UDP", "ICMP"];
const ALLOWED_PROFILES: InspectionProfile[] = [
  "BASELINE",
  "BEHAVIORAL",
  "DEEP_PACKET"
];

export function isValidIpv4(ip: string): boolean {
  return IPV4_REGEX.test(ip.trim());
}

export function ipv4ToNumber(ip: string): number | null {
  if (!isValidIpv4(ip)) {
    return null;
  }

  return ip
    .trim()
    .split(".")
    .reduce((acc, segment) => (acc << 8) + Number(segment), 0) >>> 0;
}

export function validateMonitoredRangeInput(
  input: MonitoredRangeInput
): string | null {
  if (!input.name.trim()) {
    return "Missing range name";
  }

  if (!isValidIpv4(input.startIp) || !isValidIpv4(input.endIp)) {
    return "Invalid IPv4 address in range";
  }

  const startIpNumber = ipv4ToNumber(input.startIp);
  const endIpNumber = ipv4ToNumber(input.endIp);

  if (
    startIpNumber === null ||
    endIpNumber === null ||
    startIpNumber > endIpNumber
  ) {
    return "Range start IP must be lower than or equal to end IP";
  }

  if (
    input.protocolScope &&
    !ALLOWED_PROTOCOLS.includes(input.protocolScope)
  ) {
    return "Invalid protocol scope";
  }

  if (
    input.inspectionProfile &&
    !ALLOWED_PROFILES.includes(input.inspectionProfile)
  ) {
    return "Invalid inspection profile";
  }

  return null;
}

export function normalizeMonitoredRangeInput(
  input: MonitoredRangeInput
): Required<MonitoredRangeInput> {
  return {
    name: input.name.trim(),
    startIp: input.startIp.trim(),
    endIp: input.endIp.trim(),
    description: input.description?.trim() ?? "",
    enabled: input.enabled ?? true,
    protocolScope: input.protocolScope ?? "ANY",
    inspectionProfile: input.inspectionProfile ?? "BEHAVIORAL"
  };
}

export function isIpWithinRange(ip: string, range: ComparableRange): boolean {
  const ipNumber = ipv4ToNumber(ip);
  const startNumber = ipv4ToNumber(range.startIp);
  const endNumber = ipv4ToNumber(range.endIp);

  if (
    ipNumber === null ||
    startNumber === null ||
    endNumber === null ||
    startNumber > endNumber
  ) {
    return false;
  }

  return ipNumber >= startNumber && ipNumber <= endNumber;
}

export function eventMatchesMonitoredRanges(
  srcIp: string | null | undefined,
  dstIp: string | null | undefined,
  ranges: ComparableRange[]
): boolean {
  if (ranges.length === 0) {
    return true;
  }

  return ranges.some((range) => {
    const srcMatches = srcIp ? isIpWithinRange(srcIp, range) : false;
    const dstMatches = dstIp ? isIpWithinRange(dstIp, range) : false;
    return srcMatches || dstMatches;
  });
}
