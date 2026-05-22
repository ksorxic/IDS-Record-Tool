import assert from "node:assert/strict";
import test from "node:test";
import {
  buildHealthyStateLabel,
  buildNetworkOverview,
  countActiveAlerts,
  formatByteSize,
  formatTimestamp,
  formatTransferRate,
  isCollectorActuallyRunning
} from "../lib/dashboard-client.ts";

test("dashboard client formatters return stable fallback values", () => {
  assert.equal(formatTimestamp(undefined), "No timestamp");
  assert.equal(formatTimestamp("not-a-date"), "not-a-date");
  assert.equal(formatTransferRate(125), "1.0 Kbps");
  assert.equal(formatByteSize(2048), "2.0 KB");
});

test("dashboard client helpers summarize alert and collector state", () => {
  assert.equal(
    buildHealthyStateLabel("healthy").includes("synchronized"),
    true
  );
  assert.equal(
    countActiveAlerts([
      { _id: "1", status: "open" },
      { _id: "2", status: "resolved" },
      { _id: "3", status: "investigating" }
    ]),
    2
  );
  assert.equal(isCollectorActuallyRunning(null), false);
  assert.equal(
    isCollectorActuallyRunning({
      running: true,
      origin: "managed",
      managedProcess: {
        state: "running",
        running: true,
        pid: 1,
        startedAt: null,
        lastExitAt: null,
        lastError: null,
        lastLogLine: null
      },
      runtime: null,
      latestMaliciousAlert: null
    }),
    true
  );
});

test("buildNetworkOverview derives traffic totals and busiest host", () => {
  const overview = buildNetworkOverview({
    connectionStatus: "healthy",
    summaryCards: [],
    alertsBySeverity: [],
    trafficByProtocol: [],
    hourlyTraffic: [],
    liveTraffic: {
      windowSeconds: 60,
      bucketSeconds: 5,
      totalBytesInWindow: 0,
      currentBytesPerSecond: 0,
      peakBytesPerSecond: 0,
      averageBytesPerSecond: 0,
      samples: []
    },
    monitoredRanges: [],
    blacklist: [],
    rules: [],
    alerts: [],
    trafficEvents: [
      { _id: "1", srcIp: "10.0.0.1", dstIp: "10.0.0.2", bytes: 150 },
      { _id: "2", srcIp: "10.0.0.3", dstIp: "10.0.0.2", bytes: 50 }
    ],
    topTalkers: [{ _id: "t1", ip: "10.0.0.1", bytes: 150 }]
  });

  assert.deepEqual(overview, {
    totalBytes: 200,
    uniqueSources: 2,
    uniqueDestinations: 1,
    busiestTalker: "10.0.0.1"
  });
});
