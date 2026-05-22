import test from "node:test";
import assert from "node:assert/strict";
import { TOAST_DURATION_MS, getToastTheme } from "../lib/toast-config.ts";

test("toast duration remains three seconds", () => {
  assert.equal(TOAST_DURATION_MS, 3000);
});

test("getToastTheme maps warning and error to distinct visual styles", () => {
  assert.deepEqual(getToastTheme("warning"), {
    iconName: "alert",
    containerClassName: "border-amber-200 bg-amber-50 text-amber-900",
    iconClassName: "bg-amber-500 text-slate-950"
  });

  assert.deepEqual(getToastTheme("error"), {
    iconName: "x",
    containerClassName: "border-rose-200 bg-rose-50 text-rose-900",
    iconClassName: "bg-rose-600 text-white"
  });
});
