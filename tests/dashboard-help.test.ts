import assert from "node:assert/strict";
import test from "node:test";
import { trafficCompositionHelpContent } from "../lib/dashboard-help.ts";

test("traffic composition help explains the major protocol categories in English", () => {
  assert.equal(trafficCompositionHelpContent.title, "Traffic Composition Help");
  assert.deepEqual(
    trafficCompositionHelpContent.items
      .filter((item) => item.label !== "What the number means")
      .map((item) => item.label),
    ["TCP", "UDP", "ICMP", "RTCP", "TLSv1.2", "TLSv1.3", "UNKNOWN"]
  );
});

test("traffic composition help explains what the displayed number means", () => {
  const metricItem = trafficCompositionHelpContent.items.at(-1);

  assert.equal(metricItem?.label, "What the number means");
  assert.match(metricItem?.description ?? "", /count of traffic events/i);
  assert.match(metricItem?.description ?? "", /not total bandwidth/i);
});
