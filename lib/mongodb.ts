import { MongoClient, Db } from "mongodb";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function getConnectionConfig() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  if (!dbName) {
    throw new Error("Missing MONGODB_DB");
  }

  return { uri, dbName };
}

function getClientPromise(): Promise<MongoClient> {
  const { uri } = getConnectionConfig();

  if (process.env.NODE_ENV === "development") {
    if (!global.__mongoClientPromise) {
      const client = new MongoClient(uri);
      global.__mongoClientPromise = client.connect();
    }

    return global.__mongoClientPromise;
  }

  const client = new MongoClient(uri);
  return client.connect();
}

export async function getDb(): Promise<Db> {
  const { dbName } = getConnectionConfig();
  const clientPromise = getClientPromise();
  const mongoClient = await clientPromise;
  return mongoClient.db(dbName);
}
