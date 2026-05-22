export type SettingsHelpSectionId = "ranges" | "blacklist" | "rules";

export type SettingsHelpItem = {
  icon: "tag" | "network" | "shield" | "toggle" | "file" | "globe" | "source" | "activity" | "gauge" | "clock";
  label: string;
  description: string;
  color: string;
  bg: string;
};

export type SettingsHelpContent = {
  eyebrow: string;
  title: string;
  summary: string;
  accentClassName: string;
  accentSurfaceClassName: string;
  items: SettingsHelpItem[];
};

export const settingsHelpContent: Record< SettingsHelpSectionId, SettingsHelpContent> = {
  ranges: {
    eyebrow: "Form Guide",
    title: "Monitored IP Ranges Help",
    summary:
      "Define specific segments of your LAN to allow the collector to perform targeted traffic analysis and behavioral modeling.",
    accentClassName: "text-cyan-700",
    accentSurfaceClassName: "bg-cyan-50",
    items: [
      {
        icon: "tag",
label: "Identifier Name",
        description:
          "Provide a clear name for this range, such as 'Core DMZ', 'Financial Services LAN', or 'Server Subnet v4'.",
        color: "text-blue-600",
        bg: "bg-blue-50"
      },
      {
        icon: "network",
label: "IP Boundaries",
        description:
          "Set the start and end IPv4 addresses. The system monitors all ingress and egress traffic involving these specific nodes.",
        color: "text-indigo-600",
        bg: "bg-indigo-50"
      },
      {
        icon: "globe",
label: "Protocol Filter",
        description:
          "Restrict monitoring to specific protocols (TCP, UDP, ICMP). Use 'Any' for full visibility across all transport layers.",
        color: "text-sky-600",
        bg: "bg-sky-50"
      },
      {
        icon: "shield",
label: "Inspection Profile",
        description:
          "Baseline is lightweight, Behavioral is recommended for most assets, and Deep Packet is for high-security zones.",
        color: "text-emerald-600",
        bg: "bg-emerald-50"
      },
      {
        icon: "toggle",
label: "Status Toggle",
        description:
          "When enabled, the range is actively processed. Disabling it keeps the configuration but halts real-time monitoring.",
        color: "text-amber-600",
        bg: "bg-amber-50"
      },
      {
        icon: "file",
label: "Documentation",
        description:
          "Add administrative context explaining why this subnet is monitored or which critical assets it contains.",
        color: "text-slate-600",
        bg: "bg-slate-50"
      }
    ]
  },
  blacklist: {
    eyebrow: "Form Guide",
    title: "Blacklist Control Help",
    summary:
      "Identify and flag known malicious or unauthorized IP addresses to ensure immediate alerting upon connection attempts.",
    accentClassName: "text-rose-700",
    accentSurfaceClassName: "bg-rose-50",
    items: [
      {
        icon: "globe",
label: "IPv4",
        description:
          "Enter the public or internal IPv4 address to be blacklisted. Each entry supports a single discrete address.",
        color: "text-rose-600",
        bg: "bg-rose-50"
      },
      {
        icon: "source",
label: "Intelligence Source",
        description:
          "Specify where this indicator originated (e.g., Threat Intel Feed, SOC Manual, Internal Incident).",
        color: "text-orange-600",
        bg: "bg-orange-50"
      },
      {
        icon: "file",
label: "Reasoning",
        description:
          "Document the trigger for this listing, such as Port Scanning, Malformed Packets, or Brute Force attempts.",
        color: "text-slate-600",
        bg: "bg-slate-50"
      },
      {
        icon: "toggle",
label: "Enforcement Status",
        description:
          "Active rules trigger alerts on hits. Disabled rules remain in the database for historical auditing without active alerts.",
        color: "text-red-600",
        bg: "bg-red-50"
      }
    ]
  },
  rules: {
    eyebrow: "Form Guide",
    title: "Detection Rule Help",
    summary:
      "Create custom detection rules to identify specific patterns of behavior or indicators of compromise within your monitored IP ranges.",
    accentClassName: "text-violet-600",
    accentSurfaceClassName: "bg-violet-50",
    items: [
          {
      icon: "shield",
      label: "Rule Name",
      description: "Enter a concise name identifying the detection target. Examples: 'SSH Brute Force' or 'DDoS Request Flood'.",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      icon: "activity",
      label: "Rule Type",
      description: "Select the detection pattern: FAILED_CONNECTIONS tracks TCP failures, REQUEST_FLOOD monitors high request rates, and TRAFFIC_SPIKE detects byte surges.",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      icon: "gauge",
      label: "Threshold",
      description: "The limit that triggers an alert once exceeded. For instance, set '50' for failed connections or '1000' for requests.",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      icon: "clock",
      label: "Time Window",
      description: "The duration (in minutes) for threshold evaluation. Narrower windows provide more sensitive, near real-time detection.",
      color: "text-violet-600",
      bg: "bg-violet-50"
    },
    {
      icon: "file",
      label: "Description",
      description: "Provide context for the alert. Explain the scope and the potential impact to assist incident responders.",
      color: "text-slate-600",
      bg: "bg-slate-50"
    }
  ]
  }
};
