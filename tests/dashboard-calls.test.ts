import assert from "node:assert/strict";
import test from "node:test";
import { assertSuccessfulResponse } from "../lib/calls/dashboard.ts";

test("dashboard calls assertSuccessfulResponse accepts success payloads", async () => {
  const response = new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });

  await assert.doesNotReject(() => assertSuccessfulResponse(response));
});

test("dashboard calls assertSuccessfulResponse throws API errors", async () => {
  const response = new Response(
    JSON.stringify({ success: false, error: "Collector failed" }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  await assert.rejects(
    () => assertSuccessfulResponse(response),
    /Collector failed/
  );
});
