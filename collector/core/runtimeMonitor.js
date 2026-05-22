import { getDb } from "./mongo.js";
import { logError } from "../utils/logger.js";

const DOC_ID = "primary";

export class RuntimeMonitor {
  constructor(state) {
    this.state = state;
    this.timer = null;
    this.snapshot = {
      status: "starting",
      pid: process.pid,
      startedAt: new Date().toISOString(),
      processedEvents: 0,
      totalAlerts: 0,
      latestMaliciousAlert: null
    };
  }

  buildDoc(extra = {}) {
    return {
      ...this.snapshot,
      ...extra,
      pid: process.pid,
      lastHeartbeatAt: new Date().toISOString(),
      monitoredRangeCount: this.state.runtimeConfig.monitoredRanges?.length || 0,
      requestRule: this.state.runtimeConfig.requestRule,
      failedConnectionRule: this.state.runtimeConfig.failedConnectionRule,
      trafficSpikeRule: this.state.runtimeConfig.trafficSpikeRule
    };
  }

  async flush(extra = {}) {
    const db = getDb();
    const doc = this.buildDoc(extra);
    this.snapshot = doc;
    await db.collection("collector_runtime").updateOne(
      { _id: DOC_ID },
      { $set: doc },
      { upsert: true }
    );
  }

  async start() {
    await this.flush({ _id: DOC_ID, status: "running", stoppedAt: null });

    this.timer = setInterval(() => {
      this.flush().catch((error) => {
        logError("Collector heartbeat failed", { message: error.message });
      });
    }, 5000);
  }

  recordTrafficEvent(event) {
    this.snapshot.processedEvents += 1;
    this.snapshot.lastPacketAt = event.timestamp;
  }

  recordAlert(alert) {
    this.snapshot.totalAlerts += 1;
    this.snapshot.lastAlertAt = alert.timestamp;
    this.snapshot.latestMaliciousAlert = {
      alertType: alert.alertType,
      severity: alert.severity,
      srcIp: alert.srcIp,
      dstIp: alert.dstIp,
      timestamp: alert.timestamp,
      title: alert.title,
      description: alert.description,
      status: alert.status
    };
  }

  async stop(reason = "stopped") {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    await this.flush({
      status: reason,
      stoppedAt: new Date().toISOString()
    });
  }

  async fail(message) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    await this.flush({
      status: "error",
      lastErrorAt: new Date().toISOString(),
      lastErrorMessage: message
    });
  }
}
