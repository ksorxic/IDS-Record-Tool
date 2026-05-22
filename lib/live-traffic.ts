import type { LiveTrafficMetrics, LiveTrafficSample, TrafficEvent } from "@/lib/admin-types";

type BuildLiveTrafficMetricsOptions = {
  now?: number;
  windowSeconds?: number;
  bucketSeconds?: number;
  locale?: string;
};

function buildEmptySamples(
  now: number,
  windowSeconds: number,
  bucketSeconds: number,
  locale: string
): LiveTrafficSample[] {
  const bucketCount = Math.max(1, Math.ceil(windowSeconds / bucketSeconds));
  const bucketMs = bucketSeconds * 1000;
  const startTime = now - bucketCount * bucketMs;

  return Array.from({ length: bucketCount }, (_, index) => {
    const bucketTime = new Date(startTime + (index + 1) * bucketMs);

    return {
      label: bucketTime.toLocaleTimeString(locale, {
        minute: "2-digit",
        second: "2-digit"
      }),
      totalBytes: 0,
      bytesPerSecond: 0,
      bitsPerSecond: 0
    };
  });
}

export function buildLiveTrafficMetrics(
  events: TrafficEvent[],
  options: BuildLiveTrafficMetricsOptions = {}
): LiveTrafficMetrics {
  const now = options.now ?? Date.now();
  const windowSeconds = options.windowSeconds ?? 60;
  const bucketSeconds = options.bucketSeconds ?? 2;
  const locale = options.locale ?? "en-US";
  const samples = buildEmptySamples(now, windowSeconds, bucketSeconds, locale);
  const bucketMs = bucketSeconds * 1000;
  const windowStart = now - samples.length * bucketMs;

  for (const event of events) {
    if (!event.timestamp || !event.bytes) {
      continue;
    }

    const eventTime = new Date(event.timestamp).getTime();
    if (Number.isNaN(eventTime) || eventTime < windowStart || eventTime > now) {
      continue;
    }

    const bucketIndex = Math.min(
      samples.length - 1,
      Math.max(0, Math.floor((eventTime - windowStart) / bucketMs))
    );
    samples[bucketIndex].totalBytes += event.bytes;
  }

  for (const sample of samples) {
    sample.bytesPerSecond = sample.totalBytes / bucketSeconds;
    sample.bitsPerSecond = sample.bytesPerSecond * 8;
  }

  const totalBytesInWindow = samples.reduce((sum, sample) => sum + sample.totalBytes, 0);
  const peakBytesPerSecond = samples.reduce(
    (max, sample) => Math.max(max, sample.bytesPerSecond),
    0
  );
  const currentBytesPerSecond = samples.at(-1)?.bytesPerSecond ?? 0;
  const averageBytesPerSecond = totalBytesInWindow / (samples.length * bucketSeconds);

  return {
    windowSeconds,
    bucketSeconds,
    totalBytesInWindow,
    currentBytesPerSecond,
    peakBytesPerSecond,
    averageBytesPerSecond,
    samples
  };
}
