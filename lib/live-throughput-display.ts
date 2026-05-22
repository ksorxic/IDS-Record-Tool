import type { LiveTrafficMetrics } from "@/lib/admin-types";

export type LiveThroughputDisplaySample = {
  secondsAgo: number;
  totalBytes: number;
  bytesPerSecond: number;
  bitsPerSecond: number;
};

export type LiveThroughputDisplay = {
  currentBytesPerSecond: number;
  peakBytesPerSecond: number;
  averageBytesPerSecond: number;
  totalBytesInWindow: number;
  windowSeconds: number;
  samples: LiveThroughputDisplaySample[];
};

export function buildLiveThroughputDisplay(
  metrics: LiveTrafficMetrics,
  isCollectorActive: boolean
): LiveThroughputDisplay {
  const samples = metrics.samples.map((sample, index) => ({
    secondsAgo: Math.max(
      0,
      metrics.windowSeconds -
        Math.min(metrics.windowSeconds, (index + 1) * metrics.bucketSeconds)
    ),
    totalBytes: isCollectorActive ? sample.totalBytes : 0,
    bytesPerSecond: isCollectorActive ? sample.bytesPerSecond : 0,
    bitsPerSecond: isCollectorActive ? sample.bitsPerSecond : 0
  }));

  if (!isCollectorActive) {
    return {
      currentBytesPerSecond: 0,
      peakBytesPerSecond: 0,
      averageBytesPerSecond: 0,
      totalBytesInWindow: 0,
      windowSeconds: metrics.windowSeconds,
      samples
    };
  }

  return {
    currentBytesPerSecond: metrics.currentBytesPerSecond,
    peakBytesPerSecond: metrics.peakBytesPerSecond,
    averageBytesPerSecond: metrics.averageBytesPerSecond,
    totalBytesInWindow: metrics.totalBytesInWindow,
    windowSeconds: metrics.windowSeconds,
    samples
  };
}
