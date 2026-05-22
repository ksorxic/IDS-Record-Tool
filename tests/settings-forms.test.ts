import assert from "node:assert/strict";
import test from "node:test";
import {
  applyRulePreset,
  emptyBlacklistForm,
  emptyMonitoredRangeForm,
  emptyRuleForm,
  toBlacklistForm,
  toMonitoredRangeForm,
  toRuleForm
} from "../lib/settings-forms.ts";
import { getRuleCatalogEntry } from "../lib/rule-catalog.ts";

test("empty settings forms keep expected defaults", () => {
  assert.deepEqual(emptyMonitoredRangeForm, {
    name: "",
    startIp: "",
    endIp: "",
    description: "",
    protocolScope: "ANY",
    inspectionProfile: "BEHAVIORAL",
    enabled: true
  });

  assert.deepEqual(emptyBlacklistForm, {
    ip: "",
    reason: "",
    source: "manual",
    active: true
  });

  assert.deepEqual(emptyRuleForm, {
    name: "",
    type: "TRAFFIC_SPIKE",
    threshold: "",
    windowMinutes: "",
    description: "",
    enabled: true
  });
});

test("settings form converters map persisted records to editable form values", () => {
  assert.deepEqual(
    toMonitoredRangeForm({
      _id: "range-1",
      name: "DMZ",
      startIp: "10.0.0.10",
      endIp: "10.0.0.50",
      description: "Critical zone",
      enabled: true,
      protocolScope: "TCP",
      inspectionProfile: "DEEP_PACKET",
      createdAt: "2026-05-06T10:00:00.000Z",
      updatedAt: "2026-05-06T10:00:00.000Z"
    }),
    {
      id: "range-1",
      name: "DMZ",
      startIp: "10.0.0.10",
      endIp: "10.0.0.50",
      description: "Critical zone",
      protocolScope: "TCP",
      inspectionProfile: "DEEP_PACKET",
      enabled: true
    }
  );

  assert.deepEqual(
    toBlacklistForm({
      _id: "entry-1",
      ip: "203.0.113.11",
      reason: "Scanner",
      source: "manual",
      active: true,
      createdAt: "2026-05-06T10:00:00.000Z",
      updatedAt: "2026-05-06T10:00:00.000Z"
    }),
    {
      id: "entry-1",
      ip: "203.0.113.11",
      reason: "Scanner",
      source: "manual",
      active: true
    }
  );

  assert.deepEqual(
    toRuleForm({
      _id: "rule-1",
      name: "Burst detector",
      type: "TRAFFIC_SPIKE",
      threshold: 5000,
      windowMinutes: 2,
      description: "Detects short traffic bursts",
      enabled: false,
      createdAt: "2026-05-06T10:00:00.000Z",
      updatedAt: "2026-05-06T10:00:00.000Z"
    }),
    {
      id: "rule-1",
      name: "Burst detector",
      type: "TRAFFIC_SPIKE",
      threshold: "5000",
      windowMinutes: "2",
      description: "Detects short traffic bursts",
      enabled: false
    }
  );
});

test("applyRulePreset fills the form with the recommended defaults", () => {
  const failedConnectionsPreset = getRuleCatalogEntry("FAILED_CONNECTIONS");

  assert.deepEqual(
    applyRulePreset(emptyRuleForm, "FAILED_CONNECTIONS"),
    {
      name: failedConnectionsPreset.recommendedName,
      type: "FAILED_CONNECTIONS",
      threshold: failedConnectionsPreset.recommendedThreshold,
      windowMinutes: failedConnectionsPreset.recommendedWindowMinutes,
      description: failedConnectionsPreset.recommendedDescription,
      enabled: true
    }
  );
});
