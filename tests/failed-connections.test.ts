import test from "node:test";
import assert from "node:assert/strict";
import { CollectorState } from "../collector/core/state.js";
import { normalizePacket } from "../collector/core/parser.js";
import { detectFailedConnections } from "../collector/detectors/failedConnectionDetector.js";

test("normalizePacket parses tcp handshake flags for failed-connection detection", () => {
  const event = normalizePacket([
    "1714989600.000",
    "10.0.0.10",
    "10.0.0.20",
    "53000",
    "22",
    "",
    "",
    "TCP",
    "60",
    "1",
    "0",
    "0"
  ]);

  assert.equal(event.srcPort, 53000);
  assert.equal(event.dstPort, 22);
  assert.deepEqual(event.tcpFlags, {
    syn: true,
    ack: false,
    rst: false
  });
});

test("detectFailedConnections raises an alert after repeated failed TCP attempts", () => {
  const state = new CollectorState();
  const baseTs = 1_714_989_600_000;
  state.runtimeConfig.failedConnectionRule = {
    enabled: true,
    windowSec: 60,
    threshold: 2
  };

  const attempts = [
    {
      tsMs: baseTs + 1_000,
      srcIp: "10.0.0.50",
      srcPort: 53000,
      dstIp: "10.0.0.20",
      dstPort: 22,
      protocol: "TCP",
      tcpFlags: { syn: true, ack: false, rst: false }
    },
    {
      tsMs: baseTs + 1_200,
      srcIp: "10.0.0.20",
      srcPort: 22,
      dstIp: "10.0.0.50",
      dstPort: 53000,
      protocol: "TCP",
      tcpFlags: { syn: false, ack: false, rst: true }
    },
    {
      tsMs: baseTs + 2_000,
      srcIp: "10.0.0.50",
      srcPort: 53001,
      dstIp: "10.0.0.20",
      dstPort: 22,
      protocol: "TCP",
      tcpFlags: { syn: true, ack: false, rst: false }
    },
    {
      tsMs: baseTs + 2_200,
      srcIp: "10.0.0.20",
      srcPort: 22,
      dstIp: "10.0.0.50",
      dstPort: 53001,
      protocol: "TCP",
      tcpFlags: { syn: false, ack: false, rst: true }
    },
    {
      tsMs: baseTs + 3_000,
      srcIp: "10.0.0.50",
      srcPort: 53002,
      dstIp: "10.0.0.20",
      dstPort: 22,
      protocol: "TCP",
      tcpFlags: { syn: true, ack: false, rst: false }
    },
    {
      tsMs: baseTs + 3_200,
      srcIp: "10.0.0.20",
      srcPort: 22,
      dstIp: "10.0.0.50",
      dstPort: 53002,
      protocol: "TCP",
      tcpFlags: { syn: false, ack: false, rst: true }
    }
  ];

  let alert = null;
  for (const event of attempts) {
    alert = detectFailedConnections(event, state);
  }

  assert.ok(alert);
  assert.equal(alert?.alertType, "FAILED_CONNECTIONS");
  assert.equal(alert?.srcIp, "10.0.0.50");
  assert.equal(alert?.metadata?.count, 3);
});
