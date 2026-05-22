import { cleanupOldTimestamps } from "../utils/helpers.js";

export function detectRequestFlood(event, state) {
  const config = state.runtimeConfig.requestRule;

  if (!config?.enabled) return null;
  if (!event.srcIp || !event.tsMs) return null;

  const window = state.getRequestWindow(event.srcIp);
  const minTs = event.tsMs - config.windowSec * 1000;

  window.push(event.tsMs);
  cleanupOldTimestamps(window, minTs);

  if (window.length > config.threshold) {
    const alertKey = `request-flood:${event.srcIp}`;
    if (!state.canEmitAlert(alertKey, event.tsMs, 30000)) {
      return null;
    }

    return {
      type: "SECURITY_ALERT",
      timestamp: new Date(event.tsMs).toISOString(),
      alertType: "REQUEST_FLOOD",
      severity: "high",
      status: "open",
      srcIp: event.srcIp,
      dstIp: event.dstIp,
      title: "Too many requests from same IP",
      description: `IP ${event.srcIp} generated ${window.length} requests in ${config.windowSec} seconds.`,
      metadata: {
        count: window.length,
        windowSec: config.windowSec,
        threshold: config.threshold
      }
    };
  }

  return null;
}