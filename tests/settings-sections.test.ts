import test from "node:test";
import assert from "node:assert/strict";
import {
  getDefaultSettingsSection,
  toggleSettingsSection
} from "../lib/settings-sections.ts";

test("getDefaultSettingsSection opens monitored ranges first", () => {
  assert.equal(getDefaultSettingsSection(), "ranges");
});

test("toggleSettingsSection opens a closed section and collapses an open one", () => {
  assert.equal(toggleSettingsSection(null, "rules"), "rules");
  assert.equal(toggleSettingsSection("rules", "rules"), null);
  assert.equal(toggleSettingsSection("rules", "blacklist"), "blacklist");
});
