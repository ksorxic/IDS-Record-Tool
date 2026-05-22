import test from "node:test";
import assert from "node:assert/strict";
import { getRuleCatalogEntry, ruleCatalog } from "../lib/rule-catalog.ts";

test("ruleCatalog includes failed connections as a supported policy", () => {
  assert.equal(
    ruleCatalog.some((entry) => entry.type === "FAILED_CONNECTIONS"),
    true
  );
});

test("getRuleCatalogEntry returns readable metadata for failed connections", () => {
  assert.deepEqual(getRuleCatalogEntry("FAILED_CONNECTIONS"), {
    type: "FAILED_CONNECTIONS",
    label: "Failed connections",
    helper:
      "Alert when repeated failed TCP connection attempts are observed from the same IP.",
    recommendedName: "Repeated Failed TCP Connections",
    recommendedThreshold: "10",
    recommendedWindowMinutes: "1",
    recommendedDescription:
      "Recommended rule for detecting repeated failed TCP connection attempts from the same source IP."
  });
});
