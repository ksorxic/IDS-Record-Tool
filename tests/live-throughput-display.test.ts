import assert from "node:assert/strict";
import test from "node:test";
import { buildLiveThroughputDisplay } from "../lib/live-throughput-display.ts";

const baseMetrics = {
  windowSeconds: 6,
  bucketSeconds: 2,
  totalBytesInWindow: 4000,
  currentBytesPerSecond: 500,
  peakBytesPerSecond: 1500,
  averageBytesPerSecond: 4000 / 6,
  samples: [
    { label: "a", totalBytes: 0, bytesPerSecond: 0, bitsPerSecond: 0 },
    { label: "b", totalBytes: 3000, bytesPerSecond: 1500, bitsPerSecond: 12000 },
    { label: "c", totalBytes: 1000, bytesPerSecond: 500, bitsPerSecond: 4000 }
  ]
} as const;

test("buildLiveThroughputDisplay exposes relative seconds-ago marks for the chart", () => {
  const display = buildLiveThroughputDisplay(baseMetrics, true);

  assert.deepEqual(
    display.samples.map((sample) => sample.secondsAgo),
    [4, 2, 0]
  );
  assert.equal(display.currentBytesPerSecond, 500);
});

test("buildLiveThroughputDisplay zeroes metrics when the collector is inactive", () => {
  const display = buildLiveThroughputDisplay(baseMetrics, false);

  assert.equal(display.totalBytesInWindow, 0);
  assert.equal(display.peakBytesPerSecond, 0);
  assert.equal(display.currentBytesPerSecond, 0);
  assert.deepEqual(
    display.samples.map((sample) => sample.bytesPerSecond),
    [0, 0, 0]
  );
});
