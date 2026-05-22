export class CollectorState {
  constructor() {
    this.requestsByIp = new Map();
    this.failedConnectionsByIp = new Map();
    this.bytesByIp = new Map();
    this.totalBytesByIp = new Map();
    this.pendingConnections = new Map();
    this.alertCooldowns = new Map();

    this.runtimeConfig = {
      suspiciousPorts: [23, 445, 3389, 4444, 5900, 1433, 3306, 22],
      monitoredRanges: [],
      blacklistSet: new Set(),
      requestRule: {
        enabled: true,
        windowSec: 60,
        threshold: 100
      },
      failedConnectionRule: {
        enabled: true,
        windowSec: 60,
        threshold: 10
      },
      trafficSpikeRule: {
        enabled: true,
        windowSec: 60,
        bytesThreshold: 5000000
      },
      topTalkers: {
        intervalSec: 30,
        limit: 10
      }
    };
  }

  getRequestWindow(ip) {
    if (!this.requestsByIp.has(ip)) {
      this.requestsByIp.set(ip, []);
    }
    return this.requestsByIp.get(ip);
  }

  getBytesWindow(ip) {
    if (!this.bytesByIp.has(ip)) {
      this.bytesByIp.set(ip, []);
    }
    return this.bytesByIp.get(ip);
  }

  getFailedConnectionWindow(ip) {
    if (!this.failedConnectionsByIp.has(ip)) {
      this.failedConnectionsByIp.set(ip, []);
    }
    return this.failedConnectionsByIp.get(ip);
  }

  buildConnectionAttemptKey(srcIp, srcPort, dstIp, dstPort) {
    return `${srcIp || "unknown"}:${srcPort || 0}->${dstIp || "unknown"}:${dstPort || 0}`;
  }

  setPendingConnection(key, attempt) {
    this.pendingConnections.set(key, attempt);
  }

  getPendingConnection(key) {
    return this.pendingConnections.get(key) || null;
  }

  clearPendingConnection(key) {
    this.pendingConnections.delete(key);
  }

  cleanupPendingConnections(minTs) {
    for (const [key, attempt] of this.pendingConnections.entries()) {
      if ((attempt?.tsMs || 0) < minTs) {
        this.pendingConnections.delete(key);
      }
    }
  }

  incrementTotalBytes(ip, bytes) {
    const current = this.totalBytesByIp.get(ip) || 0;
    this.totalBytesByIp.set(ip, current + (bytes || 0));
  }

  resetTopTalkersTotals() {
    this.totalBytesByIp.clear();
  }

  canEmitAlert(key, nowTs, cooldownMs = 30000) {
    const last = this.alertCooldowns.get(key) || 0;
    if (nowTs - last < cooldownMs) {
      return false;
    }
    this.alertCooldowns.set(key, nowTs);
    return true;
  }

  updateRuntimeConfig(newConfig) {
    this.runtimeConfig = {
      ...this.runtimeConfig,
      ...newConfig
    };
  }
}
