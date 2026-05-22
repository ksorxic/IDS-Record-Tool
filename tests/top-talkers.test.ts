import test from "node:test";
import assert from "node:assert/strict";
import { extractTopTalkersFromSnapshots } from "../lib/top-talkers.ts";

test("extractTopTalkersFromSnapshots uses the latest snapshot with items", () => {
  const talkers = extractTopTalkersFromSnapshots([
    {
      _id: "older",
      timestamp: "2026-05-04T10:00:00.000Z",
      metadata: {
        items: []
      }
    },
    {
      _id: "latest",
      timestamp: "2026-05-04T10:30:00.000Z",
      title: "Top talkers snapshot",
      metadata: {
        items: [
          { ip: "10.0.0.5", totalBytes: 1200 },
          { ip: "10.0.0.6", totalBytes: 900 }
        ]
      }
    }
  ]);

  assert.equal(talkers.length, 2);
  assert.deepEqual(talkers[0], {
    _id: "latest-0",
    ip: "10.0.0.5",
    bytes: 1200,
    timestamp: "2026-05-04T10:30:00.000Z",
    title: "Top talkers snapshot"
  });
});
