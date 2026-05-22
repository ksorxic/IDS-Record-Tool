import assert from "node:assert/strict";
import test from "node:test";
import { assertSuccessfulResponse } from "../lib/calls/settings.ts";

test("assertSuccessfulResponse accepts a successful payload", async () => {
  const response = new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });

  await assert.doesNotReject(() => assertSuccessfulResponse(response));
});

test("assertSuccessfulResponse throws the API error message", async () => {
  const response = new Response(
    JSON.stringify({ success: false, error: "Invalid IP address" }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  await assert.rejects(
    () => assertSuccessfulResponse(response),
    /Invalid IP address/
  );
});
