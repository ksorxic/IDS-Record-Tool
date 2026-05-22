import test from "node:test";
import assert from "node:assert/strict";
import { buildLiveTrafficMetrics } from "../lib/live-traffic.ts";

test("buildLiveTrafficMetrics groups traffic into rolling buckets and calculates rates", () => {
  const now = Date.parse("2026-05-04T10:00:00.000Z");
  const metrics = buildLiveTrafficMetrics(
    [
      {
        _id: "1",
        timestamp: "2026-05-04T09:59:56.000Z",
        bytes: 3000
      },
      {
        _id: "2",
        timestamp: "2026-05-04T09:59:59.000Z",
        bytes: 1000
      }
    ],
    {
      now,
      windowSeconds: 6,
      bucketSeconds: 2,
      locale: "en-US"
    }
  );

  assert.equal(metrics.samples.length, 3);
  assert.deepEqual(
    metrics.samples.map((sample) => sample.totalBytes),
    [0, 3000, 1000]
  );
  assert.equal(metrics.currentBytesPerSecond, 500);
  assert.equal(metrics.peakBytesPerSecond, 1500);
  assert.equal(metrics.averageBytesPerSecond, 4000 / 6);
  assert.equal(metrics.totalBytesInWindow, 4000);
});

test("buildLiveTrafficMetrics ignores invalid timestamps and zero-byte events", () => {
  const now = Date.parse("2026-05-04T10:00:00.000Z");
  const metrics = buildLiveTrafficMetrics(
    [
      {
        _id: "1",
        timestamp: "not-a-date",
        bytes: 2000
      },
      {
        _id: "2",
        timestamp: "2026-05-04T09:59:30.000Z",
        bytes: 0
      }
    ],
    {
      now,
      windowSeconds: 10,
      bucketSeconds: 2
    }
  );

  assert.equal(metrics.totalBytesInWindow, 0);
  assert.equal(metrics.currentBytesPerSecond, 0);
  assert.equal(metrics.peakBytesPerSecond, 0);
});
