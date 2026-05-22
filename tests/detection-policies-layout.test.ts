import assert from "node:assert/strict";
import test from "node:test";
import {
  detectionRuleCardActionsClassName,
  detectionRuleCardBodyClassName,
  detectionRuleCardContentClassName
} from "../lib/detection-policies-layout.ts";

test("detection rule card keeps content in a flexible column", () => {
  assert.match(detectionRuleCardBodyClassName, /\blg:flex-row\b/);
  assert.match(detectionRuleCardContentClassName, /\bflex-1\b/);
  assert.match(detectionRuleCardContentClassName, /\bmin-w-0\b/);
});

test("detection rule card actions remain in a fixed non-shrinking area", () => {
  assert.match(detectionRuleCardActionsClassName, /\bshrink-0\b/);
  assert.match(detectionRuleCardActionsClassName, /\bself-start\b/);
  assert.match(detectionRuleCardActionsClassName, /lg:min-w-\[9\.5rem\]/);
});
