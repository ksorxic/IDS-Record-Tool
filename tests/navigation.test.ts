import test from "node:test";
import assert from "node:assert/strict";
import { isPrimaryRoute, primaryNavigationItems } from "../lib/navigation.ts";

test("primaryNavigationItems exposes dashboard and settings", () => {
  assert.deepEqual(primaryNavigationItems, [
    { href: "/", label: "Dashboard" },
    { href: "/settings", label: "Settings" }
  ]);
});

test("isPrimaryRoute matches exact navigation targets", () => {
  assert.equal(isPrimaryRoute("/", "/"), true);
  assert.equal(isPrimaryRoute("/settings", "/settings"), true);
  assert.equal(isPrimaryRoute("/settings", "/"), false);
});
