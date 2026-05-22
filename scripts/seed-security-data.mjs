import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
console.log('test', uri, dbName)

if (!uri || !dbName) {
  throw new Error("Missing MONGODB_URI or MONGODB_DB");
}

const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db(dbName);

  const now = new Date().toISOString();

  const rules = [
    {
      name: "Many requests from same IP",
      type: "REQUEST_FLOOD",
      enabled: true,
      windowSec: 60,
      threshold: 100,
      createdAt: now,
      updatedAt: now
    },
    {
      name: "Traffic spike detector",
      type: "TRAFFIC_SPIKE",
      enabled: true,
      windowSec: 60,
      bytesThreshold: 5000000,
      createdAt: now,
      updatedAt: now
    },
    {
      name: "Suspicious destination ports",
      type: "SUSPICIOUS_PORTS",
      enabled: true,
      ports: [23, 445, 3389, 4444, 5900],
      createdAt: now,
      updatedAt: now
    },
    {
      name: "Top talkers snapshot settings",
      type: "TOP_TALKERS",
      enabled: true,
      intervalSec: 30,
      limit: 10,
      createdAt: now,
      updatedAt: now
    }
  ];

  const blacklistIps = [
    {
      ip: "185.220.101.1",
      reason: "Known suspicious host",
      source: "seed",
      active: true,
      createdAt: now,
      updatedAt: now
    },
    {
      ip: "123.123.123.123",
      reason: "Test blacklist IP",
      source: "seed",
      active: true,
      createdAt: now,
      updatedAt: now
    }
  ];

  for (const rule of rules) {
    await db.collection("rules").updateOne(
      { type: rule.type },
      { $set: rule },
      { upsert: true }
    );
  }

  for (const item of blacklistIps) {
    await db.collection("blacklist_ips").updateOne(
      { ip: item.ip },
      { $set: item },
      { upsert: true }
    );
  }

  console.log("Seed completed");
  await client.close();
}

main().catch(async (error) => {
  console.error(error);
  await client.close();
  process.exit(1);
});