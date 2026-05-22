import { getDb } from "./mongo.js";
import { logError, logInfo } from "../utils/logger.js";

export class BufferedWriter {
  constructor() {
    this.trafficBuffer = [];
    this.alertBuffer = [];
    this.topTalkerBuffer = [];

    this.maxBatchSize = 200;
    this.flushIntervalMs = 2000;
    this.timer = null;
  }

  start() {
    if (this.timer) return;

    this.timer = setInterval(() => {
      this.flushAll().catch((error) => {
        logError("Buffered flush failed", { message: error.message });
      });
    }, this.flushIntervalMs);

    logInfo("BufferedWriter started", {
      maxBatchSize: this.maxBatchSize,
      flushIntervalMs: this.flushIntervalMs
    });
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async addTrafficEvent(event) {
    const doc = { ...event };
    delete doc.type;
    delete doc.tsMs;

    this.trafficBuffer.push(doc);

    if (this.trafficBuffer.length >= this.maxBatchSize) {
      await this.flushTraffic();
    }
  }

  async addSecurityAlert(alertEvent) {
    const doc = { ...alertEvent };
    delete doc.type;

    this.alertBuffer.push(doc);

    if (this.alertBuffer.length >= this.maxBatchSize) {
      await this.flushAlerts();
    }
  }

  async addTopTalkerSnapshot(snapshot) {
    const doc = { ...snapshot };
    delete doc.type;

    this.topTalkerBuffer.push(doc);

    await this.flushTopTalkers();
  }

  async flushTraffic() {
    if (this.trafficBuffer.length === 0) return;

    const db = getDb();
    const docs = this.trafficBuffer.splice(0, this.trafficBuffer.length);

    await db.collection("traffic_events").insertMany(docs, { ordered: false });
  }

  async flushAlerts() {
    if (this.alertBuffer.length === 0) return;

    const db = getDb();
    const docs = this.alertBuffer.splice(0, this.alertBuffer.length);

    await db.collection("security_alerts").insertMany(docs, { ordered: false });
  }

  async flushTopTalkers() {
    if (this.topTalkerBuffer.length === 0) return;

    const db = getDb();
    const docs = this.topTalkerBuffer.splice(0, this.topTalkerBuffer.length);

    await db.collection("top_talker_snapshots").insertMany(docs, {
      ordered: false
    });
  }

  async flushAll() {
    await this.flushTraffic();
    await this.flushAlerts();
    await this.flushTopTalkers();
  }
}