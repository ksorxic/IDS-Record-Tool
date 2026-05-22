import test from "node:test";
import assert from "node:assert/strict";
import {
  eventMatchesMonitoredRanges,
  ipv4ToNumber,
  isIpWithinRange,
  isValidIpv4,
  normalizeMonitoredRangeInput,
  validateMonitoredRangeInput
} from "../lib/ip-utils.ts";

test("isValidIpv4 accepts valid IPv4 strings", () => {
  assert.equal(isValidIpv4("10.0.0.1"), true);
  assert.equal(isValidIpv4("192.168.100.250"), true);
});

test("isValidIpv4 rejects malformed IPv4 strings", () => {
  assert.equal(isValidIpv4("999.10.10.10"), false);
  assert.equal(isValidIpv4("10.10.10"), false);
  assert.equal(isValidIpv4("abc.def.ghi.jkl"), false);
});

test("ipv4ToNumber preserves ordering for ranges", () => {
  const start = ipv4ToNumber("10.0.0.10");
  const end = ipv4ToNumber("10.0.0.200");

  assert.notEqual(start, null);
  assert.notEqual(end, null);
  assert.ok((start ?? 0) < (end ?? 0));
});

test("normalizeMonitoredRangeInput trims data and applies defaults", () => {
  const normalized = normalizeMonitoredRangeInput({
    name: "  Core LAN  ",
    startIp: " 10.0.1.10 ",
    endIp: " 10.0.1.20 ",
    description: "  east-west traffic  "
  });

  assert.deepEqual(normalized, {
    name: "Core LAN",
    startIp: "10.0.1.10",
    endIp: "10.0.1.20",
    description: "east-west traffic",
    enabled: true,
    protocolScope: "ANY",
    inspectionProfile: "BEHAVIORAL"
  });
});

test("validateMonitoredRangeInput rejects reversed ranges and invalid enums", () => {
  assert.equal(
    validateMonitoredRangeInput({
      name: "Reversed",
      startIp: "10.0.0.50",
      endIp: "10.0.0.10"
    }),
    "Range start IP must be lower than or equal to end IP"
  );

  assert.equal(
    validateMonitoredRangeInput({
      name: "Protocol",
      startIp: "10.0.0.10",
      endIp: "10.0.0.20",
      protocolScope: "SCTP" as never
    }),
    "Invalid protocol scope"
  );
});

test("isIpWithinRange includes the configured start and end addresses", () => {
  const range = {
    startIp: "10.0.0.10",
    endIp: "10.0.0.20"
  };

  assert.equal(isIpWithinRange("10.0.0.10", range), true);
  assert.equal(isIpWithinRange("10.0.0.20", range), true);
  assert.equal(isIpWithinRange("10.0.0.21", range), false);
});

test("eventMatchesMonitoredRanges accepts packets that touch monitored ranges", () => {
  const ranges = [
    {
      startIp: "192.168.1.1",
      endIp: "192.168.1.50"
    }
  ];

  assert.equal(
    eventMatchesMonitoredRanges("192.168.1.20", "10.0.0.5", ranges),
    true
  );
  assert.equal(
    eventMatchesMonitoredRanges("10.0.0.5", "192.168.1.40", ranges),
    true
  );
  assert.equal(
    eventMatchesMonitoredRanges("10.0.0.5", "10.0.0.10", ranges),
    false
  );
});
