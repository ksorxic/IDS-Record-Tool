import assert from "node:assert/strict";
import test from "node:test";
import {
  severityMixCardClassName,
  severityMixChartAreaClassName
} from "../lib/dashboard-layout.ts";

test("severity mix card layout stretches to the available section height", () => {
  assert.match(severityMixCardClassName, /\bh-full\b/);
  assert.match(severityMixCardClassName, /\bflex-col\b/);
});

test("severity mix chart area keeps a larger minimum height while remaining flexible", () => {
  assert.match(severityMixChartAreaClassName, /\bflex-1\b/);
  assert.match(severityMixChartAreaClassName, /min-h-\[26rem\]/);
});
