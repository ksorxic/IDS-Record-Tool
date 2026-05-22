import assert from "node:assert/strict";
import test from "node:test";
import { settingsHelpContent } from "../lib/settings-help.ts";

test("settings help content includes monitored ranges guidance for all form fields", () => {
  const rangesHelp = settingsHelpContent.ranges;

  assert.equal(rangesHelp.title, "Monitored IP Ranges Help");
  assert.deepEqual(
    rangesHelp.items.map((item) => item.label),
    [
      "Identifier Name",
      "IP Boundaries",
      "Protocol Filter",
      "Inspection Profile",
      "Status Toggle",
      "Documentation"
    ]
  );
});

test("settings help content includes blacklist guidance for all form fields", () => {
  const blacklistHelp = settingsHelpContent.blacklist;

  assert.equal(blacklistHelp.title, "Blacklist Control Help");
  assert.deepEqual(
    blacklistHelp.items.map((item) => item.label),
    ["IPv4", "Intelligence Source", "Reasoning", "Enforcement Status"]
  );
});
