import type { DetectionRuleType } from "@/lib/admin-types";

export type RuleCatalogEntry = {
  type: DetectionRuleType;
  label: string;
  helper: string;
  recommendedName: string;
  recommendedThreshold: string;
  recommendedWindowMinutes: string;
  recommendedDescription: string;
};

export const ruleCatalog: RuleCatalogEntry[] = [
  {
    type: "TRAFFIC_SPIKE",
    label: "Traffic spike",
    helper: "Alert when one source IP produces too much traffic in a short window.",
    recommendedName: "Datacenter Traffic Spike",
    recommendedThreshold: "5000000",
    recommendedWindowMinutes: "1",
    recommendedDescription:
      "Recommended baseline rule for detecting abrupt traffic volume increases from a single source IP."
  },
  {
    type: "REQUEST_FLOOD",
    label: "Request flood",
    helper: "Alert when the same IP sends too many requests in the configured window.",
    recommendedName: "High Request Rate",
    recommendedThreshold: "100",
    recommendedWindowMinutes: "1",
    recommendedDescription:
      "Recommended rule for detecting more than 100 requests from the same IP within one minute."
  },
  {
    type: "FAILED_CONNECTIONS",
    label: "Failed connections",
    helper: "Alert when repeated failed TCP connection attempts are observed from the same IP.",
    recommendedName: "Repeated Failed TCP Connections",
    recommendedThreshold: "10",
    recommendedWindowMinutes: "1",
    recommendedDescription:
      "Recommended rule for detecting repeated failed TCP connection attempts from the same source IP."
  },
  {
    type: "SUSPICIOUS_PORTS",
    label: "Suspicious ports",
    helper: "Alert when communication targets ports marked as risky or sensitive.",
    recommendedName: "Suspicious Port Access",
    recommendedThreshold: "1",
    recommendedWindowMinutes: "5",
    recommendedDescription:
      "Recommended rule for flagging traffic toward high-risk service ports such as 23, 445, 3389, or 4444."
  },
  {
    type: "TOP_TALKERS",
    label: "Top talkers",
    helper: "Track the hosts that generate the highest traffic volume.",
    recommendedName: "Top Talkers Snapshot",
    recommendedThreshold: "10",
    recommendedWindowMinutes: "1",
    recommendedDescription:
      "Recommended operational rule for tracking the most active hosts and their traffic dominance."
  }
];

export function getRuleCatalogEntry(type: DetectionRuleType): RuleCatalogEntry {
  return (
    ruleCatalog.find((entry) => entry.type === type) ?? {
      type,
      label: type,
      helper: "Custom detection rule.",
      recommendedName: type,
      recommendedThreshold: "",
      recommendedWindowMinutes: "",
      recommendedDescription: "Custom detection rule."
    }
  );
}
