import { MongoClient } from "mongodb";
import { mongoUri, mongoDbName } from "../config.js";
import { logInfo } from "../utils/logger.js";

let client;
let db;

export async function connectMongo() {
  if (db) return db;

  client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db(mongoDbName);

  logInfo("MongoDB connected", {
    database: mongoDbName
  });

  await ensureIndexes(db);

  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("MongoDB not connected");
  }
  return db;
}

async function ensureIndexes(dbInstance) {
  await dbInstance.collection("traffic_events").createIndexes([
    { key: { timestamp: -1 } },
    { key: { srcIp: 1 } },
    { key: { dstIp: 1 } },
    { key: { dstPort: 1 } },
    { key: { protocol: 1 } }
  ]);

  await dbInstance.collection("security_alerts").createIndexes([
    { key: { timestamp: -1 } },
    { key: { alertType: 1 } },
    { key: { severity: 1 } },
    { key: { srcIp: 1 } },
    { key: { status: 1 } }
  ]);

  await dbInstance.collection("top_talker_snapshots").createIndexes([
    { key: { timestamp: -1 } }
  ]);

  await dbInstance.collection("rules").createIndexes([
    { key: { type: 1 } },
    { key: { enabled: 1 } }
  ]);

  await dbInstance.collection("blacklist_ips").createIndexes([
    { key: { ip: 1 }, unique: true }
  ]);

  await dbInstance.collection("monitored_ranges").createIndexes([
    { key: { enabled: 1 } },
    { key: { startIp: 1, endIp: 1 } }
  ]);

  await dbInstance.collection("collector_runtime").createIndexes([
    { key: { lastHeartbeatAt: -1 } },
    { key: { status: 1 } }
  ]);
}
