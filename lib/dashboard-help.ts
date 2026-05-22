export type TrafficCompositionHelpItem = {
  icon: "protocol" | "transport" | "monitor" | "fallback" | "metric";
  label: string;
  description: string;
};

export type TrafficCompositionHelpContent = {
  eyebrow: string;
  title: string;
  summary: string;
  items: TrafficCompositionHelpItem[];
};

export const trafficCompositionHelpContent: TrafficCompositionHelpContent = {
  eyebrow: "Dashboard Guide",
  title: "Traffic Composition Help",
  summary:
    "This panel groups observed network activity by protocol so every viewer can quickly understand what kind of traffic is currently flowing through the monitored environment.",
  items: [
    {
      icon: "protocol",
      label: "TCP",
      description:
        "TCP stands for Transmission Control Protocol. It is commonly used for reliable connections such as web browsing, file transfers, remote access, and many business applications."
    },
    {
      icon: "transport",
      label: "UDP",
      description:
        "UDP stands for User Datagram Protocol. It is often used for faster, connectionless communication such as DNS, streaming, voice traffic, gaming, and telemetry."
    },
    {
      icon: "monitor",
      label: "ICMP",
      description:
        "ICMP stands for Internet Control Message Protocol. It is mainly used for diagnostics and network control messages, for example ping and reachability checks."
    },
    {
      icon: "transport",
      label: "RTCP",
      description:
        "RTCP stands for Real-time Transport Control Protocol. It accompanies real-time media streams and carries control information such as delivery quality, timing, and session statistics."
    },
    {
      icon: "protocol",
      label: "TLSv1.2",
      description:
        "TLSv1.2 is a widely used Transport Layer Security version that encrypts client-server communication, for example HTTPS sessions, API calls, and other protected application traffic."
    },
    {
      icon: "protocol",
      label: "TLSv1.3",
      description:
        "TLSv1.3 is the newer Transport Layer Security version. It provides stronger defaults, a simpler handshake, and lower latency for encrypted communication."
    },
    {
      icon: "fallback",
      label: "UNKNOWN",
      description:
        "UNKNOWN means the collector could not confidently map that event to a known protocol label from the available packet fields."
    },
    {
      icon: "metric",
      label: "What the number means",
      description:
        "The number next to each category is the count of traffic events currently grouped under that protocol in the dashboard snapshot. It represents observed event volume, not total bandwidth in bytes."
    }
  ]
};
