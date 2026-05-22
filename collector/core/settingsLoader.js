import {
  defaultRequestWindowSec,
  defaultRequestThreshold,
  defaultFailedConnectionWindowSec,
  defaultFailedConnectionThreshold,
  defaultSpikeWindowSec,
  defaultSpikeBytesThreshold,
  defaultTopTalkersIntervalSec,
  defaultTopTalkersLimit,
  settingsRefreshIntervalSec
} from "../config.js";
import { normalizeMonitoredRanges } from "./monitoredRanges.js";
import { logInfo, logError } from "../utils/logger.js";

function getDefaultRuntimeConfig() {
  return {
    suspiciousPorts: [23, 445, 3389, 4444, 5900, 1433, 3306, 22],
    monitoredRanges: [],
    blacklistSet: new Set(),
    requestRule: {
      enabled: true,
      windowSec: defaultRequestWindowSec,
      threshold: defaultRequestThreshold
    },
    failedConnectionRule: {
      enabled: true,
      windowSec: defaultFailedConnectionWindowSec,
      threshold: defaultFailedConnectionThreshold
    },
    trafficSpikeRule: {
      enabled: true,
      windowSec: defaultSpikeWindowSec,
      bytesThreshold: defaultSpikeBytesThreshold
    },
    topTalkers: {
      intervalSec: defaultTopTalkersIntervalSec,
      limit: defaultTopTalkersLimit
    }
  };
}

export async function loadRuntimeConfig(db) {
  const runtime = getDefaultRuntimeConfig();

  const blacklistDocs = await db
    .collection("blacklist_ips")
    .find({ active: { $ne: false } })
    .toArray();

  runtime.blacklistSet = new Set(
    blacklistDocs.map((item) => item.ip).filter(Boolean)
  );

  const monitoredRangeDocs = await db
    .collection("monitored_ranges")
    .find({ enabled: { $ne: false } })
    .toArray();

  runtime.monitoredRanges = normalizeMonitoredRanges(monitoredRangeDocs);

  const rules = await db.collection("rules").find({ enabled: true }).toArray();

  for (const rule of rules) {
    if (rule.type === "REQUEST_FLOOD") {
      runtime.requestRule = {
        enabled: true,
        windowSec:
          Number(rule.windowSec) ||
          Number(rule.windowMinutes) * 60 ||
          runtime.requestRule.windowSec,
        threshold: Number(rule.threshold) || runtime.requestRule.threshold
      };
    }

    if (rule.type === "TRAFFIC_SPIKE") {
      runtime.trafficSpikeRule = {
        enabled: true,
        windowSec:
          Number(rule.windowSec) ||
          Number(rule.windowMinutes) * 60 ||
          runtime.trafficSpikeRule.windowSec,
        bytesThreshold:
          Number(rule.bytesThreshold) ||
          Number(rule.threshold) ||
          runtime.trafficSpikeRule.bytesThreshold
      };
    }

    if (rule.type === "FAILED_CONNECTIONS") {
      runtime.failedConnectionRule = {
        enabled: true,
        windowSec:
          Number(rule.windowSec) ||
          Number(rule.windowMinutes) * 60 ||
          runtime.failedConnectionRule.windowSec,
        threshold:
          Number(rule.threshold) || runtime.failedConnectionRule.threshold
      };
    }

    if (rule.type === "SUSPICIOUS_PORTS") {
      runtime.suspiciousPorts =
        Array.isArray(rule.ports) && rule.ports.length > 0
          ? rule.ports.map(Number).filter(Number.isFinite)
          : runtime.suspiciousPorts;
    }

    if (rule.type === "TOP_TALKERS") {
      runtime.topTalkers = {
        intervalSec: Number(rule.intervalSec) || runtime.topTalkers.intervalSec,
        limit: Number(rule.limit) || runtime.topTalkers.limit
      };
    }
  }

  return runtime;
}

export async function startSettingsRefresh(state, db, onRefresh = null) {
  async function refresh() {
    try {
      const config = await loadRuntimeConfig(db);
      state.updateRuntimeConfig(config);

      logInfo("Runtime settings refreshed", {
        blacklistCount: config.blacklistSet.size,
        monitoredRangeCount: config.monitoredRanges.length,
        suspiciousPorts: config.suspiciousPorts,
        requestRule: config.requestRule,
        failedConnectionRule: config.failedConnectionRule,
        trafficSpikeRule: config.trafficSpikeRule,
        topTalkers: config.topTalkers
      });

      if (typeof onRefresh === "function") {
        await onRefresh(config);
      }
    } catch (error) {
      logError("Failed to refresh runtime settings", {
        message: error.message
      });
    }
  }

  await refresh();
  setInterval(refresh, settingsRefreshIntervalSec * 1000);
}
